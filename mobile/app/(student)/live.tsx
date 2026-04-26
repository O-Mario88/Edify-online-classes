import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { LiveClassCard } from '@/components/LiveClassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi } from '@/api/student.api';

interface RawSession {
  id: number | string;
  scheduled_start?: string;
  duration_minutes?: number;
  status?: string;
  meeting_link?: string;
  lesson?: { title?: string; subject_name?: string; parent_class?: { subject?: { name?: string } } };
}

/**
 * Live tab — full upcoming + recent live class list. Powered by the
 * existing /live-sessions/live-session/ endpoint (already scoped on
 * the backend to the caller's enrolled classes).
 *
 * Today vs this week vs later groupings keep the list scannable.
 */
export default function LiveTab() {
  const [refreshing, setRefreshing] = useState(false);
  const query = useApiQuery<RawSession[]>(['live-sessions'], () => studentApi.liveSessions(), {
    staleTime: 30_000,
  });

  const grouped = useMemo(() => {
    const now = Date.now();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = today.getTime() + 86_400_000;
    const weekEnd = today.getTime() + 7 * 86_400_000;

    const out: { today: RawSession[]; thisWeek: RawSession[]; later: RawSession[] } = {
      today: [], thisWeek: [], later: [],
    };
    (query.data || []).forEach((s) => {
      if (!s.scheduled_start || s.status === 'cancelled') return;
      const t = new Date(s.scheduled_start).getTime();
      if (t < now - 2 * 3600_000) return; // skip ended >2h ago
      if (t < tomorrow) out.today.push(s);
      else if (t < weekEnd) out.thisWeek.push(s);
      else out.later.push(s);
    });
    const sortAsc = (a: RawSession, b: RawSession) =>
      new Date(a.scheduled_start || 0).getTime() - new Date(b.scheduled_start || 0).getTime();
    out.today.sort(sortAsc); out.thisWeek.sort(sortAsc); out.later.sort(sortAsc);
    return out;
  }, [query.data]);

  const totalCount = grouped.today.length + grouped.thisWeek.length + grouped.later.length;

  return (
    <AppScreen
      onRefresh={async () => {
        setRefreshing(true);
        await query.refetch();
        setRefreshing(false);
      }}
      refreshing={refreshing}
    >
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sessions</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Live classes</Text>
        <Text className="text-sm text-slate-600 mt-1">Real teachers. Scheduled times. Join when it starts.</Text>
      </View>
      <View className="px-5 space-y-5">
        {query.isLoading && totalCount === 0 ? (
          <LoadingSkeleton height={120} lines={3} />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : totalCount === 0 ? (
          <EmptyState
            title="No live classes scheduled"
            message="When your teacher schedules a session, it'll appear here."
          />
        ) : (
          <>
            {grouped.today.length > 0 && (
              <View>
                <SectionHeader title="Today" />
                {grouped.today.map((s) => (
                  <LiveClassCard
                    key={s.id}
                    title={s.lesson?.title || 'Live class'}
                    subject={s.lesson?.subject_name || s.lesson?.parent_class?.subject?.name}
                    scheduledStart={s.scheduled_start!}
                    durationMinutes={s.duration_minutes}
                    meetingLink={s.meeting_link}
                  />
                ))}
              </View>
            )}
            {grouped.thisWeek.length > 0 && (
              <View>
                <SectionHeader title="This week" />
                {grouped.thisWeek.map((s) => (
                  <LiveClassCard
                    key={s.id}
                    title={s.lesson?.title || 'Live class'}
                    subject={s.lesson?.subject_name || s.lesson?.parent_class?.subject?.name}
                    scheduledStart={s.scheduled_start!}
                    durationMinutes={s.duration_minutes}
                    meetingLink={s.meeting_link}
                  />
                ))}
              </View>
            )}
            {grouped.later.length > 0 && (
              <View>
                <SectionHeader title="Later" />
                {grouped.later.map((s) => (
                  <LiveClassCard
                    key={s.id}
                    title={s.lesson?.title || 'Live class'}
                    subject={s.lesson?.subject_name || s.lesson?.parent_class?.subject?.name}
                    scheduledStart={s.scheduled_start!}
                    durationMinutes={s.duration_minutes}
                    meetingLink={s.meeting_link}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </AppScreen>
  );
}
