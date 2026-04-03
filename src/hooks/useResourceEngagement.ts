import { useState, useEffect, useRef, useCallback } from 'react';
import { ResourceEngagement } from '../types';

export interface UseResourceEngagementProps {
  studentId: string;
  resourceId: string;
  assignedBy: 'teacher' | 'intervention' | 'self' | 'system';
  onCompletionChange?: (isCompleted: boolean, percentage: number) => void;
}

export function useResourceEngagement({
  studentId,
  resourceId,
  assignedBy,
  onCompletionChange
}: UseResourceEngagementProps) {
  // Engagement State
  const [activeTimeMinutes, setActiveTimeMinutes] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastPosition, setLastPosition] = useState(0); // Scroll position or video timestamp

  // Refs for tracking time accurately without dependency cycles
  const isTracking = useRef(true);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const activeTimeSeconds = useRef(0);
  
  // Start or resume tracking
  const startTracking = useCallback(() => {
    isTracking.current = true;
    if (!timerInterval.current) {
      timerInterval.current = setInterval(() => {
        if (isTracking.current && !document.hidden) {
          activeTimeSeconds.current += 1;
          // Update state every minute
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

    // Consider completed if >= 90%
    if (cappedPercentage >= 90 && !isCompleted) {
      setIsCompleted(true);
      if (onCompletionChange) {
        onCompletionChange(true, cappedPercentage);
      }
    }
  }, [isCompleted, onCompletionChange]);

  // Generate a snapshot of current engagement (would be sent to API)
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

  return {
    activeTimeMinutes,
    completionPercentage,
    isCompleted,
    lastPosition,
    reportProgress,
    pauseTracking,
    startTracking,
    getEngagementSnapshot
  };
}
