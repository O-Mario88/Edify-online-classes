import { useState, useEffect } from 'react';

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  resourceId: string;
  resourceTitle: string;
  subject: string;
  topic: string;
  submittedAt: string;
  status: 'pending_grading' | 'graded';
  fileUrl?: string; // Mock uploaded file proxy
  mcqScore?: number;
  maxScore?: number;
}

const STORAGE_KEY = 'edify_assignment_submissions_db';

export const useAssignmentSubmissions = () => {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSubmissions(JSON.parse(stored));
      } else {
        // Hydrate with some initial mock data for the demo
        const mockInit: AssignmentSubmission[] = [
          {
            id: 'sub-demo-1',
            studentId: 'stu-x',
            studentName: 'Amani K.',
            resourceId: 'asgn-2',
            resourceTitle: 'Conceptual Recap - Vectors',
            subject: 'Mathematics',
            topic: 'Vector Geometry',
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'pending_grading',
            fileUrl: 'fake-file.pdf',
            mcqScore: 8,
            maxScore: 10
          }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInit));
        setSubmissions(mockInit);
      }
    } catch {
      // localStorage unavailable or JSON corrupt — leave submissions empty.
    }
  }, []);

  const addSubmission = (sub: Omit<AssignmentSubmission, 'id'>) => {
    const payload = { ...sub, id: `sub-${Date.now()}` };
    setSubmissions(prev => {
      const updated = [payload, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('edify_submission_sync'));
      return updated;
    });
  };

  const markAsGraded = (id: string) => {
    setSubmissions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, status: 'graded' as const } : s);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Sync across tabs/components
  useEffect(() => {
    const sync = () => {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) setSubmissions(JSON.parse(data));
    };
    window.addEventListener('edify_submission_sync', sync);
    return () => window.removeEventListener('edify_submission_sync', sync);
  }, []);

  return { submissions, addSubmission, markAsGraded };
};
