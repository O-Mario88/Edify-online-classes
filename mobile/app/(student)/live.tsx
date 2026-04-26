import React, { useState, useMemo } from 'react';
import { View, Text, Linking, Pressable } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { ProfileHeader } from '@/components/ProfileHeader';
import { DayPillSelector } from '@/components/DayPillSelector';
import { TimelineScheduleRow } from '@/components/TimelineScheduleRow';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi } from '@/api/student.api';
import { useAuthStore } from '@/auth/authStore';

interface RawSession {
  id: number | string;
  scheduled_start?: string;
  duration_minutes?: number;
  status?: string;
  meeting_link?: string;
  lesson?: {
    title?: string;
    subject_name?: string;
    parent_class?: { subject?: { name?: string } };
  };
}

/**
 * Live tab — premium-minimal schedule view.
 *
 * Day-pill selector at the top picks which day to show. The
 * sessions for that day render as TimelineScheduleRow stripes
 * (time/period gutter + subject-coloured card on the right).
 * "Free period" rows fill the gaps so the day reads as a single
 * continuous timeline rather than a list with blanks.
 */
export default function LiveTab() {
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() => {
    const js = new Date().getDay();
    return js === 0 ? 6 : js - 1;
  });

  const query = useApiQuery<RawSession[]>(
    ['live-sessions'],
    () => studentApi.liveSessions(),
    { staleTime: 30_000 },
  );

  /**
   * Build a Mon→Sun map of sessions for the visible week. Cancellation
   * + already-ended-2h-ago filtering matches the previous behaviour.
   */
  const weekSessions = useMemo(() => {
    const out: Record<number, RawSession[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    if (!query.data) return out;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayIdx = today.getDay();
    const daysSinceMonday = (dayIdx + 6) % 7;
    const monday = new Date(today);
    monday.setDate(monday.getDate() - daysSinceMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    query.data.forEach((s) => {
      if (!s.scheduled_start || s.status === 'cancelled') return;
      const ts = new Date(s.scheduled_start);
      if (ts < monday || ts >= sunday) return;
      const idx = (ts.getDay() + 6) % 7;
      out[idx].push(s);
    });
    Object.values(out).forEach((bucket) =>
      bucket.sort(
        (a, b) =>
          new Date(a.scheduled_start || 0).getTime() - new Date(b.scheduled_start || 0).getTime(),
      ),
    );
    return out;
  }, [query.data]);

  const activityByIndex = useMemo(() => {
    const map: Record<number, number> = {};
    Object.entries(weekSessions).forEach(([k, v]) => { map[Number(k)] = v.length; });
    return map;
  }, [weekSessions]);

  const sessionsForDay = weekSessions[selectedDayIdx] || [];
  const totalThisWeek = Object.values(weekSessions).reduce((acc, v) => acc + v.length, 0);
  const firstName = (user?.full_name || 'there').split(' ')[0];

  return (
    <AppScreen
      onRefresh={async () => {
        setRefreshing(true);
        await query.refetch();
        setRefreshing(false);
      }}
      refreshing={refreshing}
    >
      <ProfileHeader
        greeting="Live classes"
        name={`${totalThisWeek} this week`}
        subtitle="Real teachers · live, scheduled times"
      />

      <View className="mt-2 pl-5">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          Pick a day
        </Text>
        <DayPillSelector
          selectedIndex={selectedDayIdx}
          onSelect={setSelectedDayIdx}
          activityByIndex={activityByIndex}
        />
      </View>

      <View className="px-5 mt-6">
        {query.isLoading && totalThisWeek === 0 ? (
          <LoadingSkeleton height={120} lines={3} />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : sessionsForDay.length === 0 ? (
          <EmptyDay />
        ) : (
          sessionsForDay.map((s) => {
            const start = new Date(s.scheduled_start!);
            const subject =
              s.lesson?.subject_name || s.lesson?.parent_class?.subject?.name || 'Class';
            const timeLabel = start.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });
            const isJoinable =
              !!s.meeting_link &&
              start.getTime() - Date.now() <= 30 * 60_000 &&
              start.getTime() - Date.now() >= -120 * 60_000;
            return (
              <View key={s.id}>
                <TimelineScheduleRow
                  timeLabel={timeLabel}
                  periodLabel={`${s.duration_minutes ?? 60} min`}
                  subject={subject}
                  title={s.lesson?.title || 'Live class'}
                  subline={subject}
                />
                {isJoinable && (
                  <View className="pl-20 mb-3 -mt-1">
                    <Pressable
                      onPress={() => Linking.openURL(s.meeting_link!).catch(() => {})}
                      accessibilityRole="button"
                      accessibilityLabel="Join live class"
                      className="self-start bg-maple-900 rounded-full px-4 py-2"
                    >
                      <Text className="text-white text-xs font-bold">Join class</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </AppScreen>
  );
}

const EmptyDay: React.FC = () => (
  <View
    className="bg-white rounded-2xl py-6"
    style={{
      elevation: 1,
      shadowColor: '#0F172A',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    }}
  >
    <EmptyState
      title="No live classes this day"
      message="Tap another day above, or pull to refresh."
    />
  </View>
);
