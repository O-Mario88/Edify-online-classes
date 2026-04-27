import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

interface NotificationData {
  /** Pre-baked Expo Router route, e.g. "/(student)/lesson/42". */
  route?: string;
  /** Backend domain key, mapped via DOMAIN_TO_ROUTE below. */
  kind?: string;
  /** Resource id appended to the mapped route. */
  id?: string | number;
}

/**
 * Maps a domain "kind" (set by the backend on the push payload) to a
 * Expo-Router path. Keep this in sync with the backend notification
 * service so taps land on the right screen.
 */
const DOMAIN_TO_ROUTE: Record<string, (id?: string | number) => string> = {
  live_class:        () => '/(student)/live',
  assignment:        (id) => id ? `/(student)/assessment/${id}` : '/(student)/tasks',
  teacher_feedback:  () => '/(student)/teacher-feedback',
  support_answered:  () => '/(student)/support-tracker',
  exam_practice:     () => '/(student)/exam-sim',
  badge_earned:      () => '/(student)/passport',
  parent_brief:      () => '/(parent)',
  payment_confirmed: () => '/(student)/payment',
  application_response: () => '/(parent)/applications',
  // Teacher
  new_question:        () => '/(teacher)/questions',
  review_pending:      () => '/(teacher)/reviews',
  payout_update:       () => '/(teacher)/earnings',
  // Institution
  admission_ping:      () => '/(institution)/admissions',
  risk_alert:          () => '/(institution)/health',
};

const resolveRoute = (data: NotificationData): string | null => {
  if (data.route) return data.route;
  if (data.kind && DOMAIN_TO_ROUTE[data.kind]) {
    return DOMAIN_TO_ROUTE[data.kind](data.id);
  }
  return null;
};

/**
 * Hook that wires push-notification taps into the Expo Router. Listens
 * for both cold-start taps (the user opened the app via a notification)
 * and warm-start taps (the app was already running). Mounts once at
 * the root and routes the navigator forward when a tap arrives.
 */
export const useNotificationRouting = () => {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    // Cold start: app launched by tapping a notification.
    Notifications.getLastNotificationResponseAsync().then((resp) => {
      if (cancelled || !resp) return;
      const data = (resp.notification.request.content.data || {}) as NotificationData;
      const route = resolveRoute(data);
      if (route) router.replace(route as any);
    });

    // Warm start: tap while app is open or backgrounded.
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const data = (resp.notification.request.content.data || {}) as NotificationData;
      const route = resolveRoute(data);
      if (route) router.push(route as any);
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [router]);
};
