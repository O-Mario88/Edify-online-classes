import { useState, useEffect } from 'react';

export interface ContinuityState {
  lastReadingResource: ContinuityResource | null;
  lastVideoResource: ContinuityResource | null;
  lastLearningNode: LearningNode | null;
}

export interface ContinuityResource {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'document' | 'note' | 'interactive'; // 'video' goes to continue watching, others to continue reading
  subject: string;
  topic: string;
  lesson?: string;
  progressPercentage: number;
  lastPosition?: number; // scroll pos or timestamp
  lastActiveAt: string; // ISO string
  isCompleted: boolean;
}

export interface LearningNode {
  subject: string;
  topic: string;
  lesson?: string;
  path: string; // the actual URL path to resume
  description: string;
  isPendingWork: boolean;
  lastActiveAt: string;
}

const CONTINUITY_STORAGE_KEY = 'edify_student_continuity_state';

const defaultState: ContinuityState = {
  lastReadingResource: null,
  lastVideoResource: null,
  lastLearningNode: null,
};

export const useStudentContinuity = () => {
  const [continuityState, setContinuityState] = useState<ContinuityState>(defaultState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONTINUITY_STORAGE_KEY);
      if (stored) {
        setContinuityState(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load continuity state', err);
    }
  }, []);

  const saveState = (newState: ContinuityState) => {
    try {
      localStorage.setItem(CONTINUITY_STORAGE_KEY, JSON.stringify(newState));
      setContinuityState(newState);
      // Trigger a custom event so other tabs/components update automatically
      window.dispatchEvent(new Event('edify_continuity_updated'));
    } catch (err) {
      console.error('Failed to save continuity state', err);
    }
  };

  const updateResourceState = (resource: ContinuityResource) => {
    setContinuityState(prev => {
      const newState = { ...prev };
      
      // If completed, we remove it from "continue X" slot
      if (resource.isCompleted) {
        if (resource.type === 'video' && newState.lastVideoResource?.id === resource.id) {
          newState.lastVideoResource = null;
        } else if (resource.type !== 'video' && newState.lastReadingResource?.id === resource.id) {
          newState.lastReadingResource = null;
        }
      } else {
        // Not completed, update the slot
        if (resource.type === 'video') {
          newState.lastVideoResource = resource;
        } else {
          newState.lastReadingResource = resource;
        }
      }
      
      saveState(newState);
      return newState;
    });
  };

  const updateLearningNode = (node: LearningNode) => {
    setContinuityState(prev => {
      const newState = { ...prev, lastLearningNode: node };
      saveState(newState);
      return newState;
    });
  };

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
    updateResourceState,
    updateLearningNode,
  };
};
