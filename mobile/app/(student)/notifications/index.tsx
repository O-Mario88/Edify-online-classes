import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi, type StudentHomePayload } from '@/api/student.api';
import { registerForPush, type PermissionState } from '@/notifications/pushRegistration';

interface FeedItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  tintBg: string;
  tintFg: string;
  title: string;
  body: string;
  whenLabel: string;
  onPress?: () => void;
}

/**
 * Notifications feed. Two layers:
 *   1. Permission card — prompts the user to enable push, shows status
 *      once granted, and is a no-op when already on.
 *   2. Activity list — synthesised from the student-home aggregator
 *      (live class, overdue work, upcoming work, recent lessons) so the
 *      surface is real even before a dedicated /mobile/notifications/
 *      endpoint exists.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const homeQuery = useApiQuery<StudentHomePayload>(
    ['student-home'],
    () => studentApi.home(),
    { staleTime: 60_000 },
  );

  // Re-check permission state on mount so a user who toggled it in
  // Settings sees the right card without a manual refresh.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const Notifications = await import('expo-notifications');
        const existing = await Notifications.getPermissionsAsync();
        if (!cancelled) setPermission(existing.status as PermissionState);
      } catch {
        // expo-notifications can fail in some hosts (web, very old sims) — ignore.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onRequestPermission = async () => {
    setRequesting(true);
    const result = await registerForPush();
    setPermission(result.permission);
    setPushToken(result.token);
    setRequesting(false);
  };

  const data = homeQuery.data;
  const feed = useMemo<FeedItem[]>(() => {
    if (!data) return [];
    const items: FeedItem[] = [];

    if (data.next_live_session) {
      items.push({
        id: `live-${data.next_live_session.id}`,
        icon: 'videocam-outline',
        tintBg: '#DBEAFE',
        tintFg: '#1E40AF',
        title: `Live class: ${data.next_live_session.title}`,
        body: `${data.next_live_session.subject} · ${data.next_live_session.duration_minutes} min`,
        whenLabel: relativeTime(data.next_live_session.scheduled_start),
        onPress: () => router.push('/(student)/live' as any),
      });
    }

    (data.upcoming_assignments || []).slice(0, 5).forEach((a) => {
      const overdue = new Date(a.close_at).getTime() < Date.now();
      items.push({
        id: `assign-${a.id}`,
        icon: overdue ? 'alert-circle-outline' : 'time-outline',
        tintBg: overdue ? '#FFE4E6' : '#FEF3C7',
        tintFg: overdue ? '#9F1239' : '#92400E',
        title: overdue ? `Overdue: ${a.title}` : `Due soon: ${a.title}`,
        body: `${a.subject} · ${a.topic}`,
        whenLabel: relativeTime(a.close_at),
        onPress: () => router.push(`/(student)/assessment/${a.assessment_id}` as any),
      });
    });

    (data.recent_lessons || []).slice(0, 3).forEach((l) => {
      items.push({
        id: `lesson-${l.id}`,
        icon: 'book-outline',
        tintBg: '#EDE9FE',
        tintFg: '#5B21B6',
        title: `New lesson: ${l.title}`,
        body: `${l.subject} · ${l.duration_label}`,
        whenLabel: 'Just added',
        onPress: () => router.push(`/(student)/lesson/${l.id}` as any),
      });
    });

    return items;
  }, [data, router]);

  return (
    <AppScreen
      onRefresh={async () => {
        setRefreshing(true);
        await homeQuery.refetch();
        setRefreshing(false);
      }}
      refreshing={refreshing}
    >
      <View className="px-5 pt-6 pb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm font-semibold text-maple-900">← Back</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(student)/notifications/preferences' as any)}
            accessibilityRole="button"
            accessibilityLabel="Notification preferences"
            className="w-9 h-9 rounded-full bg-white items-center justify-center"
            style={{
              elevation: 1,
              shadowColor: '#0F172A',
              shadowOpacity: 0.05,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Ionicons name="settings-outline" size={18} color="#334155" />
          </Pressable>
        </View>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Notifications</Text>
        <Text className="text-2xl font-extrabold text-slate-900">What's new</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Class reminders, deadlines, and teacher feedback all in one list.
        </Text>
      </View>

      <View className="px-5">
        <PermissionCard
          permission={permission}
          requesting={requesting}
          onRequest={onRequestPermission}
          tokenPresent={!!pushToken}
        />
      </View>

      <View className="px-5 mt-5">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          Recent activity
        </Text>

        {homeQuery.isLoading && !data ? (
          <LoadingSkeleton height={84} lines={4} />
        ) : homeQuery.isError ? (
          <ErrorState onRetry={() => homeQuery.refetch()} />
        ) : feed.length === 0 ? (
          <EmptyState
            title="Nothing to show yet"
            message="Heads-up about live classes, overdue work, and teacher replies will appear here."
          />
        ) : (
          <View>
            {feed.map((item) => (
              <FeedRow key={item.id} item={item} />
            ))}
          </View>
        )}
      </View>
    </AppScreen>
  );
}

const PermissionCard: React.FC<{
  permission: PermissionState;
  requesting: boolean;
  onRequest: () => void;
  tokenPresent: boolean;
}> = ({ permission, requesting, onRequest, tokenPresent }) => {
  if (permission === 'granted') {
    return (
      <View
        className="rounded-3xl p-4 flex-row items-center"
        style={{ backgroundColor: '#D1FAE5' }}
      >
        <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
          <Ionicons name="checkmark-circle" size={22} color="#065F46" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-extrabold text-emerald-900">Push notifications are on</Text>
          <Text className="text-xs text-emerald-800 mt-0.5">
            {tokenPresent ? 'You\'ll be the first to know about new updates.' : 'Permission granted — token will sync on next refresh.'}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View
      className="rounded-3xl p-4 flex-row items-center"
      style={{ backgroundColor: '#E0E7FF' }}
    >
      <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
        <Ionicons name="notifications-outline" size={22} color="#3730A3" />
      </View>
      <View className="flex-1 pr-3">
        <Text className="text-sm font-extrabold text-indigo-900">Turn on push</Text>
        <Text className="text-xs text-indigo-800 mt-0.5">
          We'll only ping you for live classes, deadlines, and teacher replies.
        </Text>
      </View>
      <Pressable
        onPress={onRequest}
        disabled={requesting}
        accessibilityRole="button"
        accessibilityLabel="Enable push notifications"
        className="px-3 py-2 rounded-full bg-maple-900"
      >
        <Text className="text-xs font-bold text-white">{requesting ? 'Asking…' : 'Enable'}</Text>
      </Pressable>
    </View>
  );
};

const FeedRow: React.FC<{ item: FeedItem }> = ({ item }) => (
  <Pressable
    onPress={item.onPress}
    accessibilityRole="button"
    accessibilityLabel={item.title}
    className="bg-white rounded-2xl p-4 mb-3 flex-row items-start"
    style={{
      elevation: 1,
      shadowColor: '#0F172A',
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    }}
  >
    <View
      className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
      style={{ backgroundColor: item.tintBg }}
    >
      <Ionicons name={item.icon} size={18} color={item.tintFg} />
    </View>
    <View className="flex-1">
      <View className="flex-row items-start justify-between">
        <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900 flex-1 pr-2">
          {item.title}
        </Text>
        <Text className="text-[10px] font-semibold text-slate-400">{item.whenLabel}</Text>
      </View>
      <Text numberOfLines={2} className="text-xs text-slate-600 mt-0.5">{item.body}</Text>
    </View>
  </Pressable>
);

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = t - Date.now();
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  if (abs < 60_000) return 'now';
  if (minutes < 60) return diff > 0 ? `in ${minutes}m` : `${minutes}m ago`;
  if (hours < 24) return diff > 0 ? `in ${hours}h` : `${hours}h ago`;
  return diff > 0 ? `in ${days}d` : `${days}d ago`;
}
