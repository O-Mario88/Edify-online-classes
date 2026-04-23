/**
 * Intelligence Engine Hooks
 * Provides data fetching for NBA, Study Planner, Passports, Health Score, Story Cards.
 * Falls back to mock data when API is unavailable.
 */
import { useState, useEffect, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '../lib/apiClient';
import type { ActionQueueItem } from '../components/teachers/NextBestActionQueue';
import type { StudyTask } from '../components/students/SmartStudyPlanner';

// ─── Types ───

interface NBAAction {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  action_type: string;
  action_url: string;
  reason: string;
  confidence_score: number;
  target_role: string;
  created_at: string;
  expires_at: string | null;
}

interface StudyPlanAPI {
  id: number;
  week_start: string;
  week_end: string;
  total_estimated_minutes: number;
  completed_minutes: number;
  completion_pct: number;
  tasks: StudyTaskAPI[];
}

interface StudyTaskAPI {
  id: number;
  title: string;
  task_type: string;
  status: string;
  urgency: string;
  subject_name: string | null;
  scheduled_date: string;
  estimated_minutes: number;
  reason: string;
}

interface StoryCardAPI {
  id: number;
  headline: string;
  body: string;
  tone: string;
  audience: string;
  action_url: string;
  is_read: boolean;
  created_at: string;
}

interface HealthSnapshotAPI {
  overall_score: number;
  teacher_activity_score: number;
  student_attendance_score: number;
  assignment_completion_score: number;
  resource_engagement_score: number;
  parent_engagement_score: number;
  intervention_completion_score: number;
  risk_level: string;
  risk_factors: string[];
  score_change: number | null;
  date: string;
}

interface ParentActionAPI {
  id: number;
  title: string;
  description: string;
  action_type: string;
  status: string;
  child_name: string;
  data_payload: Record<string, unknown>;
  created_at: string;
}

// ─── Next Best Action Hook ───

const NBA_TYPE_MAP: Record<string, ActionQueueItem['type']> = {
  assessment: 'urgent_academic',
  academic: 'urgent_academic',
  attendance: 'attendance_risk',
  intervention: 'followup',
  resource: 'peer_support',
  engagement: 'peer_support',
  operational: 'grading_blocker',
};

export function useNextBestActions() {
  const [actions, setActions] = useState<ActionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = useCallback(async () => {
    try {
      // First try to generate fresh actions
      await apiClient.post(API_ENDPOINTS.INTELLIGENCE_ACTIONS + 'generate/', {});

      const response = await apiClient.get<{ results: NBAAction[] }>(API_ENDPOINTS.INTELLIGENCE_ACTIONS);
      const items = response.data?.results || [];

      setActions(items.map((a) => ({
        id: String(a.id),
        title: a.title,
        description: a.description,
        type: NBA_TYPE_MAP[a.category] || 'followup',
        priority: a.priority === 'critical' ? 'high' : a.priority as 'high' | 'medium' | 'low',
        actionLabel: a.action_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      })));
    } catch {
      // Return mock data as fallback
      setActions(getMockActions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActions(); }, [fetchActions]);

  const dismissAction = useCallback(async (id: string) => {
    try {
      await apiClient.post(`${API_ENDPOINTS.INTELLIGENCE_ACTIONS}${id}/dismiss/`, {});
      setActions(prev => prev.filter(a => a.id !== id));
    } catch { /* ignore */ }
  }, []);

  const completeAction = useCallback(async (id: string) => {
    try {
      await apiClient.post(`${API_ENDPOINTS.INTELLIGENCE_ACTIONS}${id}/complete/`, {});
      setActions(prev => prev.filter(a => a.id !== id));
    } catch { /* ignore */ }
  }, []);

  return { actions, loading, dismissAction, completeAction, refetch: fetchActions };
}

// ─── Study Planner Hook ───

const TASK_TYPE_MAP: Record<string, StudyTask['type']> = {
  revision: 'weak_topic',
  assignment: 'deadline',
  practice: 'exam_prep',
  video: 'custom',
  reading: 'custom',
  intervention: 'missed_work',
  live_session: 'custom',
  project: 'custom',
};

export function useStudyPlanner() {
  const [plan, setPlan] = useState<StudyPlanAPI | null>(null);
  const [dailyPlan, setDailyPlan] = useState<{ dayOfWeek: string; date: string; tasks: StudyTask[] }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    try {
      // Generate/refresh the plan
      const genResponse = await apiClient.post<StudyPlanAPI>(
        API_ENDPOINTS.INTELLIGENCE_STUDY_PLANS + 'generate/', {}
      );
      const planData = genResponse.data;
      setPlan(planData);

      // Group tasks by day
      const grouped: Record<string, StudyTask[]> = {};
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      for (const task of planData?.tasks || []) {
        const date = new Date(task.scheduled_date);
        const dayOfWeek = days[date.getDay()];
        const key = task.scheduled_date;

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
          id: String(task.id),
          title: task.title,
          type: TASK_TYPE_MAP[task.task_type] || 'custom',
          subject: task.subject_name || 'General',
          durationMinutes: task.estimated_minutes,
          isCompleted: task.status === 'completed',
        });
      }

      setDailyPlan(Object.entries(grouped).map(([date, tasks]) => {
        const d = new Date(date);
        return {
          dayOfWeek: days[d.getDay()],
          date,
          tasks,
        };
      }).sort((a, b) => a.date.localeCompare(b.date)));
    } catch {
      setDailyPlan(getMockDailyPlan());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const completeTask = useCallback(async (taskId: string, actualMinutes?: number) => {
    try {
      await apiClient.post(`${API_ENDPOINTS.INTELLIGENCE_STUDY_TASKS}${taskId}/complete/`, {
        actual_minutes: actualMinutes,
      });
      fetchPlan(); // Refresh
    } catch { /* ignore */ }
  }, [fetchPlan]);

  return { plan, dailyPlan, loading, completeTask, refetch: fetchPlan };
}

// ─── Parent Actions Hook ───

export function useParentActions() {
  const [actions, setActions] = useState<ParentActionAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = useCallback(async () => {
    try {
      const response = await apiClient.get<{ results: ParentActionAPI[] }>(API_ENDPOINTS.INTELLIGENCE_PARENT_ACTIONS);
      setActions(response.data?.results || []);
    } catch {
      setActions(getMockParentActions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActions(); }, [fetchActions]);

  const acknowledgeAction = useCallback(async (id: number) => {
    try {
      await apiClient.post(`${API_ENDPOINTS.INTELLIGENCE_PARENT_ACTIONS}${id}/acknowledge/`, {});
      setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
    } catch { /* ignore */ }
  }, []);

  return { actions, loading, acknowledgeAction, refetch: fetchActions };
}

// ─── Story Cards Hook ───

export function useStoryCards() {
  const [cards, setCards] = useState<StoryCardAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    try {
      // Generate fresh cards
      await apiClient.post(API_ENDPOINTS.INTELLIGENCE_STORY_CARDS + 'generate/', {});

      const response = await apiClient.get<{ results: StoryCardAPI[] }>(API_ENDPOINTS.INTELLIGENCE_STORY_CARDS);
      setCards(response.data?.results || []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const markRead = useCallback(async (id: number) => {
    try {
      await apiClient.post(`${API_ENDPOINTS.INTELLIGENCE_STORY_CARDS}${id}/mark_read/`, {});
      setCards(prev => prev.filter(c => c.id !== id));
    } catch { /* ignore */ }
  }, []);

  return { cards, loading, markRead, refetch: fetchCards };
}

// ─── Health Score Hook ───

export function useInstitutionHealth(institutionId?: number | string) {
  const [health, setHealth] = useState<HealthSnapshotAPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) {
      setLoading(false);
      return;
    }

    const fetchHealth = async () => {
      try {
        const response = await apiClient.get<HealthSnapshotAPI>(
          `${API_ENDPOINTS.INTELLIGENCE_HEALTH}?institution=${institutionId}`
        );
        setHealth(response.data);
      } catch {
        setHealth(getMockHealth());
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, [institutionId]);

  // Map to SchoolHealthScore props shape
  const metrics = health ? {
    attendance: health.student_attendance_score,
    academicPerformance: health.assignment_completion_score,
    teacherPunctuality: health.teacher_activity_score,
    behavior: health.resource_engagement_score,
    parentEngagement: health.parent_engagement_score,
    interventionCompletion: health.intervention_completion_score,
  } : null;

  return { health, metrics, loading };
}

// ─── Student Passport Hook ───

export function useStudentPassport() {
  const [passport, setPassport] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const response = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.INTELLIGENCE_STUDENT_PASSPORT);
        setPassport(response.data);
      } catch {
        setPassport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPassport();
  }, []);

  return { passport, loading };
}

// ─── Teacher Passport Hook ───

export function useTeacherPassport() {
  const [passport, setPassport] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const response = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.INTELLIGENCE_TEACHER_PASSPORT);
        setPassport(response.data);
      } catch {
        setPassport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPassport();
  }, []);

  return { passport, loading };
}

// ─── Learning Progress Hook ───

export function useLearningProgress() {
  const updateProgress = useCallback(async (
    contentType: string, contentId: number, progressPct: number, lastPosition?: Record<string, unknown>
  ) => {
    try {
      await apiClient.post(API_ENDPOINTS.INTELLIGENCE_LEARNING_PROGRESS + 'update_progress/', {
        content_type: contentType,
        content_id: contentId,
        progress_pct: progressPct,
        last_position: lastPosition || {},
      });
    } catch { /* ignore */ }
  }, []);

  return { updateProgress };
}

// ─── Challenges Hook ───

export function useChallenges() {
  const [challenges, setChallenges] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await apiClient.get<{ results: Record<string, unknown>[] }>(API_ENDPOINTS.INTELLIGENCE_CHALLENGES);
        setChallenges(response.data?.results || []);
      } catch {
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const joinChallenge = useCallback(async (id: number) => {
    try {
      await apiClient.post(`${API_ENDPOINTS.INTELLIGENCE_CHALLENGES}${id}/join/`, {});
    } catch { /* ignore */ }
  }, []);

  return { challenges, loading, joinChallenge };
}

// ─── Mock Data Fallbacks ───

function getMockActions(): ActionQueueItem[] {
  return [
    {
      id: 'mock-1', title: 'Review at-risk students', description: '3 students flagged as at-risk this week',
      type: 'urgent_academic', priority: 'high', actionLabel: 'View Students',
    },
    {
      id: 'mock-2', title: 'Mark pending submissions', description: '12 submissions awaiting your review',
      type: 'grading_blocker', priority: 'medium', actionLabel: 'Start Marking',
    },
    {
      id: 'mock-3', title: 'Low attendance follow-up', description: 'Class 3A attendance dropped below 80%',
      type: 'attendance_risk', priority: 'high', actionLabel: 'Check Attendance',
    },
  ];
}

function getMockDailyPlan(): { dayOfWeek: string; date: string; tasks: StudyTask[] }[] {
  const today = new Date();
  return [
    {
      dayOfWeek: today.toLocaleDateString('en', { weekday: 'long' }),
      date: today.toISOString().split('T')[0],
      tasks: [
        { id: 'mock-t1', title: 'Revise Mathematics', type: 'weak_topic', subject: 'Mathematics', durationMinutes: 45, isCompleted: false },
        { id: 'mock-t2', title: 'Complete English essay', type: 'deadline', subject: 'English', durationMinutes: 60, isCompleted: false },
      ],
    },
  ];
}

function getMockParentActions(): ParentActionAPI[] {
  return [
    { id: 1, title: 'Your child was absent yesterday', description: 'Please follow up.', action_type: 'attendance_issue', status: 'pending', child_name: 'Student', data_payload: {}, created_at: new Date().toISOString() },
    { id: 2, title: '2 incomplete assignments', description: 'Due this week.', action_type: 'home_follow_up', status: 'pending', child_name: 'Student', data_payload: {}, created_at: new Date().toISOString() },
  ];
}

function getMockHealth(): HealthSnapshotAPI {
  return {
    overall_score: 72,
    teacher_activity_score: 78,
    student_attendance_score: 82,
    assignment_completion_score: 65,
    resource_engagement_score: 58,
    parent_engagement_score: 45,
    intervention_completion_score: 70,
    risk_level: 'healthy',
    risk_factors: [],
    score_change: 3.2,
    date: new Date().toISOString().split('T')[0],
  };
}
