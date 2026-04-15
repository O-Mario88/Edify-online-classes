import { useState, useEffect, useRef, useCallback } from 'react';
import contentApi, { ContinueLearningItem } from '../lib/contentApi';

export interface ContinuityState {
  lastReadingResource: ContinuityResource | null;
  lastVideoResource: ContinuityResource | null;
  lastLearningNode: LearningNode | null;
  continueLearning: ContinueLearningItem[];
}

export interface ContinuityResource {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'document' | 'note' | 'interactive';
  subject: string;
  topic: string;
  lesson?: string;
  progressPercentage: number;
  lastPosition?: number;
  lastActiveAt: string;
  isCompleted: boolean;
}

export interface LearningNode {
  subject: string;
  topic: string;
  lesson?: string;
  path: string;
  description: string;
  isPendingWork: boolean;
  lastActiveAt: string;
}

const CONTINUITY_STORAGE_KEY = 'edify_student_continuity_state';

const defaultState: ContinuityState = {
  lastReadingResource: null,
  lastVideoResource: null,
  lastLearningNode: null,
  continueLearning: [],
};

export const useStudentContinuity = () => {
  const [continuityState, setContinuityState] = useState<ContinuityState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  // Load from localStorage first, then hydrate from backend
  useEffect(() => {
    // 1. Restore local state immediately for fast UX
    try {
      const stored = localStorage.getItem(CONTINUITY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setContinuityState({ ...defaultState, ...parsed });
        }
      }
    } catch (err) {
      console.error('Failed to load continuity state', err);
    }

    // 2. Fetch backend continue_learning data
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      contentApi.dashboard.student()
        .then((dashboard) => {
          setContinuityState(prev => {
            const state = prev || defaultState;
            const items = dashboard?.continue_learning || [];
            // Derive lastReadingResource / lastVideoResource from backend data
            const isIncomplete = (i: ContinueLearningItem) => i.status !== 'completed' && i.completion_percentage < 100;
            const reading = items.find(i => i.content_type !== 'video' && isIncomplete(i));
            const video = items.find(i => i.content_type === 'video' && isIncomplete(i));

            const newState: ContinuityState = {
              ...state,
              continueLearning: items,
              lastReadingResource: reading ? {
                id: reading.content_item_id,
                title: reading.title,
                type: (reading.content_type as ContinuityResource['type']) || 'document',
                subject: reading.subject_name || '',
                topic: reading.topic_name || '',
                progressPercentage: reading.completion_percentage,
                lastPosition: reading.last_position,
                lastActiveAt: reading.last_accessed || new Date().toISOString(),
                isCompleted: false,
              } : state.lastReadingResource,
              lastVideoResource: video ? {
                id: video.content_item_id,
                title: video.title,
                type: 'video',
                subject: video.subject_name || '',
                topic: video.topic_name || '',
                progressPercentage: video.completion_percentage,
                lastPosition: video.last_position,
                lastActiveAt: video.last_accessed || new Date().toISOString(),
                isCompleted: false,
              } : state.lastVideoResource,
            };

            saveToLocalStorage(newState);
            return newState;
          });
        })
        .catch(() => {
          // Backend unavailable — fall back to localStorage state
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  const saveToLocalStorage = (state: ContinuityState) => {
    try {
      localStorage.setItem(CONTINUITY_STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('edify_continuity_updated'));
    } catch (err) {
      console.error('Failed to save continuity state', err);
    }
  };

  const saveState = useCallback((newState: ContinuityState) => {
    saveToLocalStorage(newState);
    setContinuityState(newState);
  }, []);

  const updateResourceState = useCallback((resource: ContinuityResource) => {
    setContinuityState(prev => {
      const newState = { ...prev };

      if (resource.isCompleted) {
        if (resource.type === 'video' && newState.lastVideoResource?.id === resource.id) {
          newState.lastVideoResource = null;
        } else if (resource.type !== 'video' && newState.lastReadingResource?.id === resource.id) {
          newState.lastReadingResource = null;
        }
      } else {
        if (resource.type === 'video') {
          newState.lastVideoResource = resource;
        } else {
          newState.lastReadingResource = resource;
        }
      }

      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const updateLearningNode = useCallback((node: LearningNode) => {
    setContinuityState(prev => {
      const newState = { ...prev, lastLearningNode: node };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Refresh continue_learning from backend
  const refreshContinuity = useCallback(() => {
    return contentApi.dashboard.student()
      .then((dashboard) => {
        setContinuityState(prev => {
          const newState = { ...prev, continueLearning: dashboard?.continue_learning || [] };
          saveToLocalStorage(newState);
          return newState;
        });
      })
      .catch(() => {});
  }, []);

  // Listen to custom event for cross-component sync
  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem(CONTINUITY_STORAGE_KEY);
      if (stored) {
        setContinuityState(JSON.parse(stored));
      }
    };
    window.addEventListener('edify_continuity_updated', handleSync);
    return () => window.removeEventListener('edify_continuity_updated', handleSync);
  }, []);

  return {
    continuityState,
    isLoading,
    updateResourceState,
    updateLearningNode,
    refreshContinuity,
  };
};
