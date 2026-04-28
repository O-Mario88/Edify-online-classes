import React, { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { teacherApi, type TeacherTodayClass } from '@/api/teacher.api';

/**
 * Today's classes — every live session the teacher owns, grouped into
 * "Now" / "Coming up today" / "Later this week". Tapping Join opens
 * the meeting URL externally; Quick-note publishing is a one-tap
 * shortcut at the bottom for after class wraps.
 */
export default function TeacherTodayTab() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const query = useApiQuery<TeacherTodayClass[]>(
    ['teacher-today'],
    () => teacherApi.todayLiveSessions(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const sessions = query.data ?? [];
  const now = Date.now();
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const live = sessions.filter((s) => {
    const start = new Date(s.scheduled_start).getTime();
    const end = start + (s.duration_minutes || 60) * 60_000;
    return start <= now && end >= now;
  });
  const upcoming = sessions.filter((s) => {
    const start = new Date(s.scheduled_start).getTime();
    return start > now && start <= todayEnd.getTime();
  });
  const later = sessions.filter((s) => new Date(s.scheduled_start).getTime() > todayEnd.getTime());

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Schedule</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Today's classes</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Join in one tap, mark attendance, and publish notes the moment class ends.
        </Text>
      </View>

      {query.isLoading && sessions.length === 0 ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : sessions.length === 0 ? (
        <View className="px-5">
          <EmptyState
            title="No classes scheduled"
            message="When you have a live class on your calendar it'll appear here."
          />
        </View>
      ) : (
        <View className="px-5">
          {live.length > 0 && <Section label="Now">{live.map((s) => <ClassRow key={s.id} cls={s} now />)}</Section>}
          {upcoming.length > 0 && <Section label="Coming up today">{upcoming.map((s) => <ClassRow key={s.id} cls={s} />)}</Section>}
          {later.length > 0 && <Section label="Later this week">{later.map((s) => <ClassRow key={s.id} cls={s} />)}</Section>}
        </View>
      )}

      <View className="px-5 mt-7 mb-2">
        <Pressable
          onPress={() => router.push('/(teacher)/quick-note' as any)}
          accessibilityRole="button"
          accessibilityLabel="Publish a quick note"
          className="rounded-3xl p-4 flex-row items-center"
          style={{
            backgroundColor: '#E0E7FF',
            elevation: 1,
            shadowColor: '#0F172A',
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
            <Ionicons name="create-outline" size={22} color="#3730A3" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-indigo-900">Publish a quick note</Text>
            <Text className="text-xs text-indigo-800 mt-0.5">
              Drop a paragraph, link, or PDF the moment class wraps.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#3730A3" />
        </Pressable>
      </View>
    </AppScreen>
  );
}

const Section: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
  <View className="mb-5">
    <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">{label}</Text>
    {children}
  </View>
);

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

const ClassRow: React.FC<{ cls: TeacherTodayClass; now?: boolean }> = ({ cls, now }) => {
  const time = new Date(cls.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const join = () => {
    if (cls.meeting_link) Linking.openURL(cls.meeting_link).catch(() => {});
  };
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3"
      style={[
        cardShadow,
        { borderWidth: now ? 2 : 0, borderColor: now ? '#0F2A45' : 'transparent' },
      ]}
    >
      <View className="flex-row items-center">
        <View className="w-11 h-11 rounded-2xl bg-blue-100 items-center justify-center mr-3">
          <Ionicons name="videocam-outline" size={20} color="#1E40AF" />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">{cls.title}</Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            {cls.subject} · {cls.duration_minutes} min · {cls.student_count || 0} student{cls.student_count === 1 ? '' : 's'}
          </Text>
        </View>
        <Text className="text-[11px] font-bold text-blue-800">{now ? 'NOW' : time}</Text>
      </View>
      {cls.meeting_link && (
        <Pressable
          onPress={join}
          accessibilityRole="button"
          accessibilityLabel="Join class"
          className={`mt-3 py-2.5 rounded-2xl items-center ${now ? 'bg-maple-900' : 'bg-slate-100'}`}
        >
          <Text className={`text-xs font-bold ${now ? 'text-white' : 'text-slate-900'}`}>
            {now ? 'Join now' : 'Open class link'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};
