import { useState, useEffect, useRef, useCallback } from 'react';
import { ResourceEngagement } from '../types';
import contentApi from '../lib/contentApi';

export interface UseResourceEngagementProps {
  studentId: string;
  resourceId: string;
  assignedBy: 'teacher' | 'intervention' | 'self' | 'system';
  interactionType?: 'reading' | 'watching' | 'listening' | 'interactive' | 'assessment';
  onCompletionChange?: (isCompleted: boolean, percentage: number) => void;
}

export function useResourceEngagement({
  studentId,
  resourceId,
  assignedBy,
  interactionType = 'reading',
  onCompletionChange
}: UseResourceEngagementProps) {
  // Engagement State
  const [activeTimeMinutes, setActiveTimeMinutes] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastPosition, setLastPosition] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Refs for tracking time accurately without dependency cycles
  const isTracking = useRef(true);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const activeTimeSeconds = useRef(0);
  const sessionIdRef = useRef<string | null>(null);

  // Keep ref in sync with state for use in callbacks
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Start or resume tracking
  const startTracking = useCallback(() => {
    isTracking.current = true;
    if (!timerInterval.current) {
      timerInterval.current = setInterval(() => {
        if (isTracking.current && !document.hidden) {
          activeTimeSeconds.current += 1;
          if (activeTimeSeconds.current % 60 === 0) {
            setActiveTimeMinutes(Math.floor(activeTimeSeconds.current / 60));
          }
        }
      }, 1000);
    }
  }, []);

  // Pause tracking
  const pauseTracking = useCallback(() => {
    isTracking.current = false;
  }, []);

  // Cleanup
  const stopTracking = useCallback(() => {
    isTracking.current = false;
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, []);

  // ── Session lifecycle: start on mount, end on unmount ──
  useEffect(() => {
    contentApi.engagement.startSession({
      content_item_id: resourceId,
      interaction_type: interactionType,
    }).then((session) => {
      setSessionId(session.id);
    }).catch(() => {
      // Session start is non-critical; continue without session
    });

    return () => {
      // End session on unmount
      const sid = sessionIdRef.current;
      if (sid) {
        contentApi.engagement.endSession(sid, {
          progress_at_end: completionPercentage,
        }).catch(() => {});
      }
    };
    // Only run on mount/unmount — resourceId changes mean a new component instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);

  // Lifecycle listeners for window focus/blur
  useEffect(() => {
    startTracking();

    const handleFocus = () => startTracking();
    const handleBlur = () => pauseTracking();
    const handleVisibilityChange = () => {
      if (document.hidden) pauseTracking();
      else startTracking();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopTracking();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startTracking, pauseTracking, stopTracking]);

  // Expose API for components to report progress
  const reportProgress = useCallback((percentage: number, position: number) => {
    const cappedPercentage = Math.min(100, Math.max(0, percentage));
    setCompletionPercentage(cappedPercentage);
    setLastPosition(position);

    if (cappedPercentage >= 90 && !isCompleted) {
      setIsCompleted(true);
      if (onCompletionChange) {
        onCompletionChange(true, cappedPercentage);
      }
    }
  }, [isCompleted, onCompletionChange]);

  // Generate a snapshot of current engagement
  const getEngagementSnapshot = useCallback((): Partial<ResourceEngagement> => {
    return {
      resourceId,
      studentId,
      assignedBy,
      totalActiveTimeMins: Math.floor(activeTimeSeconds.current / 60),
      completionPercentage,
      lastPosition,
      isCompleted
    };
  }, [resourceId, studentId, assignedBy, completionPercentage, lastPosition, isCompleted]);

  // ── Backend sync: periodic heartbeat + on-unmount flush ──
  const lastSyncRef = useRef<number>(0);

  const syncToBackend = useCallback(() => {
    const seconds = activeTimeSeconds.current;
    if (seconds <= 0) return;

    contentApi.engagement.track({
      content_item_id: resourceId,
      active_time_seconds: seconds,
      completion_percentage: completionPercentage,
      last_position: lastPosition,
      is_completed: isCompleted,
      ...(sessionIdRef.current ? { session_id: sessionIdRef.current } : {}),
    }).catch(() => {
      // Engagement tracking is non-critical; swallow errors silently
    });

    lastSyncRef.current = seconds;
  }, [resourceId, completionPercentage, lastPosition, isCompleted]);

  // Heartbeat: sync every 30 seconds
  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (activeTimeSeconds.current > lastSyncRef.current + 15) {
        syncToBackend();
      }
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      syncToBackend();
    };
  }, [syncToBackend]);

  return {
    activeTimeMinutes,
    completionPercentage,
    isCompleted,
    lastPosition,
    sessionId,
    reportProgress,
    pauseTracking,
    startTracking,
    getEngagementSnapshot
  };
}
