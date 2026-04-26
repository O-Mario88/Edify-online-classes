import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { ProfileHeader } from '@/components/ProfileHeader';
import { QuickActionGrid, type QuickAction } from '@/components/QuickActionGrid';
import { DayPillSelector } from '@/components/DayPillSelector';
import { TimelineScheduleRow } from '@/components/TimelineScheduleRow';
import { TodayHero } from '@/components/TodayHero';
import { LiveClassCard } from '@/components/LiveClassCard';
import { AssignmentCard } from '@/components/AssignmentCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi, type StudentHomePayload } from '@/api/student.api';
import { useAuthStore } from '@/auth/authStore';

/**
 * Student home — premium-minimal refresh.
 *
 * Layout, top → bottom:
 *   1. ProfileHeader (greeting + name + stage chip)
 *   2. QuickActionGrid: 8 white-card tiles with pastel icon discs
 *   3. DayPillSelector — Mon–Sun chips, today filled
 *   4. TodayHero — single priority action
 *   5. KPI strip (4 tiles) — canonical learner vocabulary
 *   6. Today's plan timeline (TimelineScheduleRow per task)
 *   7. Next live class card
 *   8. First 3 upcoming assignments
 *
 * All seven blocks read off one /mobile/student-home/ round-trip.
 */
export default function StudentHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() => {
    const js = new Date().getDay();
    return js === 0 ? 6 : js - 1;
  });

  const homeQuery = useApiQuery<StudentHomePayload>(
    ['student-home'],
    () => studentApi.home(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await homeQuery.refetch();
    setRefreshing(false);
  };

  const data = homeQuery.data;
  const firstName = (user?.full_name || data?.user?.full_name || 'there').split(' ')[0];
  const stageLabel = (data?.user?.stage || (user as any)?.stage) === 'primary' ? 'Primary · P4–P7' : 'Secondary · S1–S6';

  const quickActions = useMemo<QuickAction[]>(() => [
    { key: 'live',     label: 'Live classes', glyph: '🎥', tint: 'blue',    onPress: () => router.push('/(student)/live' as any) },
    { key: 'tasks',    label: 'Tasks',        glyph: '📋', tint: 'amber',   onPress: () => router.push('/(student)/tasks' as any), badge: data?.kpis?.overdue_work || 0 },
    { key: 'practice', label: 'Practice',     glyph: '🧪', tint: 'emerald', onPress: () => router.push('/(student)/learn' as any) },
    { key: 'passport', label: 'Passport',     glyph: '🏅', tint: 'orange',  onPress: () => router.push('/(student)/profile' as any) },
    { key: 'mastery',  label: 'Mastery',      glyph: '🎯', tint: 'rose',    onPress: () => router.push('/(student)/learn' as any) },
    { key: 'library',  label: 'Library',      glyph: '📚', tint: 'purple',  onPress: () => router.push('/(student)/learn' as any) },
    { key: 'support',  label: 'Ask teacher',  glyph: '🤝', tint: 'teal',    onPress: () => router.push('/(student)/profile' as any) },
    { key: 'pay',      label: 'Plan',         glyph: '💳', tint: 'indigo',  onPress: () => router.push('/(student)/profile' as any) },
  ], [router, data?.kpis?.overdue_work]);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <ProfileHeader
        greeting="Welcome back"
        name={firstName}
        subtitle={stageLabel}
        unreadCount={data?.kpis?.overdue_work || 0}
      />

      {homeQuery.isLoading && !data ? (
        <View className="px-5 mt-4">
          <LoadingSkeleton height={160} lines={2} />
        </View>
      ) : homeQuery.isError ? (
        <View className="px-5 mt-4">
          <ErrorState onRetry={() => homeQuery.refetch()} />
        </View>
      ) : data ? (
        <>
          {/* 1. Quick actions */}
          <View className="mt-2 pl-5">
            <SectionLabel>Quick actions</SectionLabel>
            <QuickActionGrid actions={quickActions} />
          </View>

          {/* 2. This week */}
          <View className="mt-7 pl-5">
            <View className="pr-5 mb-3">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">This week</Text>
              <Text className="text-base font-extrabold text-slate-900 mt-0.5">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <DayPillSelector selectedIndex={selectedDayIdx} onSelect={setSelectedDayIdx} />
          </View>

          {/* 3. Today hero */}
          <View className="px-5 mt-6">
            <TodayHero payload={data.today} />
          </View>

          {/* 4. Standing this term */}
          <View className="px-5 mt-6">
            <SectionLabel>My standing</SectionLabel>
            <KpiStrip kpis={data.kpis} />
          </View>

          {/* 5. Today's plan timeline */}
          <View className="px-5 mt-6">
            <View className="flex-row items-end justify-between mb-3">
              <SectionLabel className="mb-0">Today's plan</SectionLabel>
              {data.today_tasks && data.today_tasks.length > 0 && (
                <Text className="text-xs font-semibold text-slate-500">{data.today_tasks.length} tasks</Text>
              )}
            </View>
            <TodayPlanTimeline tasks={data.today_tasks || []} />
          </View>

          {/* 6. Next live class */}
          {data.next_live_session && (
            <View className="px-5 mt-6">
              <SectionLabel>Next live class</SectionLabel>
              <LiveClassCard
                title={data.next_live_session.title}
                subject={data.next_live_session.subject}
                scheduledStart={data.next_live_session.scheduled_start}
                durationMinutes={data.next_live_session.duration_minutes}
                meetingLink={data.next_live_session.meeting_link}
              />
            </View>
          )}

          {/* 7. Upcoming work preview */}
          {data.upcoming_assignments && data.upcoming_assignments.length > 0 && (
            <View className="px-5 mt-6">
              <SectionLabel>Upcoming work</SectionLabel>
              {data.upcoming_assignments.slice(0, 3).map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  onPress={() => router.push(`/(student)/assessment/${a.assessment_id}` as any)}
                />
              ))}
            </View>
          )}
        </>
      ) : null}
    </AppScreen>
  );
}

const SectionLabel: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <Text className={`text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 ${className}`}>{children}</Text>
);

const KpiStrip: React.FC<{ kpis: StudentHomePayload['kpis'] }> = ({ kpis }) => (
  <View className="flex-row -mx-1.5">
    <KpiTile label="Progress"   value={`${kpis.overall_progress}%`} accent="text-emerald-700" />
    <KpiTile label="Attendance" value={`${kpis.attendance}%`}       accent={kpis.attendance < 75 ? 'text-rose-600' : 'text-emerald-700'} />
    <KpiTile label="Readiness"  value={`${kpis.exam_readiness}`}    accent="text-indigo-700" />
    <KpiTile label="Overdue"    value={`${kpis.overdue_work}`}      accent={kpis.overdue_work > 0 ? 'text-amber-700' : 'text-emerald-700'} />
  </View>
);

const KpiTile: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <View className="flex-1 px-1.5">
    <View
      className="bg-white rounded-2xl p-4"
      style={{
        elevation: 1,
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</Text>
      <Text className={`text-xl font-extrabold mt-1 ${accent}`}>{value}</Text>
    </View>
  </View>
);

const TodayPlanTimeline: React.FC<{ tasks: StudentHomePayload['today_tasks'] }> = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
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
          title="Nothing scheduled for today"
          message="Your plan refreshes daily. Pull down to refresh."
        />
      </View>
    );
  }
  // Time labels are computed sequentially because backend tasks don't
  // yet carry per-task scheduled_at. Once they do, render that field.
  return (
    <View>
      {tasks.map((t, i) => {
        const hour = 9 + i;
        const timeLabel = `${(hour % 12) || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
        return (
          <TimelineScheduleRow
            key={t.id || i}
            timeLabel={timeLabel}
            periodLabel={`Period ${i + 1}`}
            subject={t.subject}
            title={t.title}
            subline={t.duration_minutes ? `${t.duration_minutes} min` : undefined}
          />
        );
      })}
    </View>
  );
};
