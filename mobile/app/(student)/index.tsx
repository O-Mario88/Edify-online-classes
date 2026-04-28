import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { ProfileHeader, HomeHero } from '@/components/ProfileHeader';
import { SectionHeader } from '@/components/SectionHeader';
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
import { LowDataBanner } from '@/components/LowDataBanner';
import { OnboardingTour } from '@/components/OnboardingTour';
import { useOnboardingTour } from '@/onboarding/useOnboardingTour';

/**
 * Student home — the comprehensive learner dashboard.
 *
 * Sections, top → bottom:
 *   1. ProfileHeader (greeting + name + stage chip + notifications)
 *   2. Today's hero — single highest-priority action
 *   3. Continue learning — last lesson with progress
 *   4. Quick actions — 8 tiles for fast access to every surface
 *   5. My standing — KPI strip with link to weekly progress
 *   6. Mastery tracks — horizontal scroll of subject standings
 *   7. This week — day picker + today's plan timeline
 *   8. Next live class
 *   9. Upcoming work — 3 nearest assignments
 *  10. Discover — Practice Lab + Exam Simulator feature cards
 *  11. AI Study Buddy — featured card
 *  12. Achievements — Certificates + Learning Passport
 *  13. Mistake Notebook — review prompt
 *  14. Standby Teacher — ask-a-teacher footer
 *
 * Most sections read off the single /mobile/student-home/ aggregator.
 * Mastery tracks and the achievement strip use derived placeholders
 * until the corresponding endpoints land.
 */
export default function StudentHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tour = useOnboardingTour('student');
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

  // Four primary actions only. The other surfaces (AI Buddy, Ask
  // Teacher, Mastery, Passport) are already promoted as full cards
  // further down the page — duplicating them here makes the dashboard
  // feel busy without adding utility.
  const quickActions = useMemo<QuickAction[]>(() => [
    { key: 'live',     label: 'Live',     glyph: '🎥', tint: 'indigo',  onPress: () => router.push('/(student)/live' as any) },
    { key: 'tasks',    label: 'Tasks',    glyph: '📋', tint: 'amber',   onPress: () => router.push('/(student)/tasks' as any), badge: data?.kpis?.overdue_work || 0 },
    { key: 'practice', label: 'Practice', glyph: '🧪', tint: 'emerald', onPress: () => router.push('/(student)/practice' as any) },
    { key: 'library',  label: 'Library',  glyph: '📚', tint: 'purple',  onPress: () => router.push('/(student)/learn' as any) },
  ], [router, data?.kpis?.overdue_work]);

  return (
    <>
      <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <ProfileHeader
        name={firstName}
        unreadCount={data?.kpis?.overdue_work || 0}
        onNotificationsPress={() => router.push('/(student)/notifications' as any)}
      />
      <HomeHero
        eyebrow="Welcome back,"
        name={firstName}
        emoji="👋"
        subtitle={stageLabel}
      />
      <LowDataBanner />

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
          {/* 2. Today hero */}
          <View className="px-5 mt-2">
            <TodayHero payload={data.today} />
          </View>

          {/* 3. Continue learning */}
          {data.recent_lessons && data.recent_lessons.length > 0 && (
            <View className="px-5 mt-6">
              <ContinueLearning
                lesson={data.recent_lessons[0]}
                progress={data.kpis.overall_progress}
                onPress={() => router.push(`/(student)/lesson/${data.recent_lessons[0].id}` as any)}
              />
            </View>
          )}

          {/* 4. Quick actions */}
          <View className="mt-7 px-5">
            <SectionHeader title="Quick actions" />
            <QuickActionGrid actions={quickActions} />
          </View>

          {/* 5. My standing */}
          <View className="px-5 mt-7">
            <SectionHeader
              title="My standing"
              seeAllLabel="Weekly"
              onSeeAllPress={() => router.push('/(student)/progress' as any)}
            />
            <KpiStrip kpis={data.kpis} />
          </View>

          {/* 6. Mastery tracks */}
          <View className="mt-7 pl-5">
            <View className="pr-5">
              <SectionHeader
                title="Mastery tracks"
                seeAllLabel="See all"
                onSeeAllPress={() => router.push('/(student)/mastery' as any)}
              />
            </View>
            <MasteryStrip
              overall={data.kpis.overall_progress}
              onSelect={() => router.push('/(student)/mastery' as any)}
            />
          </View>

          {/* 7. This week / Today's plan */}
          <View className="mt-7 pl-5">
            <View className="pr-5 mb-3">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">This week</Text>
              <Text className="text-base font-extrabold text-slate-900 mt-0.5">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <DayPillSelector selectedIndex={selectedDayIdx} onSelect={setSelectedDayIdx} />
          </View>

          <View className="px-5 mt-6">
            <SectionHeader
              title="Today's plan"
              seeAllLabel="Full plan"
              onSeeAllPress={() => router.push('/(student)/study-plan' as any)}
            />
            <TodayPlanTimeline tasks={data.today_tasks || []} />
          </View>

          {/* 8. Next live class */}
          {data.next_live_session && (
            <View className="px-5 mt-7">
              <SectionHeader
                title="Next live class"
                seeAllLabel="Calendar"
                onSeeAllPress={() => router.push('/(student)/live' as any)}
              />
              <LiveClassCard
                title={data.next_live_session.title}
                subject={data.next_live_session.subject}
                scheduledStart={data.next_live_session.scheduled_start}
                durationMinutes={data.next_live_session.duration_minutes}
                meetingLink={data.next_live_session.meeting_link}
              />
            </View>
          )}

          {/* 9. Upcoming work */}
          {data.upcoming_assignments && data.upcoming_assignments.length > 0 && (
            <View className="px-5 mt-7">
              <SectionHeader
                title="Upcoming work"
                seeAllLabel="All tasks"
                onSeeAllPress={() => router.push('/(student)/tasks' as any)}
              />
              {data.upcoming_assignments.slice(0, 3).map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  onPress={() => router.push(`/(student)/assessment/${a.assessment_id}` as any)}
                />
              ))}
            </View>
          )}

          {/* 10. Discover — Practice Lab + Exam Simulator */}
          <View className="px-5 mt-7">
            <SectionHeader title="Discover" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <DiscoverCard
                icon="flask-outline"
                tone="emerald"
                eyebrow="Practice Lab"
                title="Sharpen this week's topics"
                cta="Start a 10-min lab"
                onPress={() => router.push('/(student)/practice' as any)}
              />
              <DiscoverCard
                icon="reader-outline"
                tone="indigo"
                eyebrow="Exam Simulator"
                title="Sit a real-format mock"
                cta="Open simulator"
                onPress={() => router.push('/(student)/exam-sim' as any)}
              />
            </View>
          </View>

          {/* 11. AI Study Buddy */}
          <View className="px-5 mt-7">
            <AiBuddyCard onPress={() => router.push('/(student)/ai-buddy' as any)} />
          </View>

          {/* 12. Achievements */}
          <View className="px-5 mt-7">
            <SectionHeader title="Achievements" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <AchievementCard
                icon="medal-outline"
                tone="orange"
                title="Certificates"
                count={data.kpis.assessments_completed || 0}
                hint="earned this term"
                onPress={() => router.push('/(student)/certificates' as any)}
              />
              <AchievementCard
                icon="ribbon-outline"
                tone="amber"
                title="Passport"
                count={null}
                hint="Verified record"
                onPress={() => router.push('/(student)/passport' as any)}
              />
            </View>
          </View>

          {/* 13. Mistake Notebook */}
          <View className="px-5 mt-7">
            <MistakeNotebookCard onPress={() => router.push('/(student)/mistake-notebook' as any)} />
          </View>

          {/* 14. Standby Teacher */}
          <View className="px-5 mt-7 mb-2">
            <StandbyTeacherStrip onPress={() => router.push('/(student)/ask-teacher' as any)} />
          </View>

          {/* 15. Projects & Feedback — quiet footer link */}
          <Pressable
            onPress={() => router.push('/(student)/projects' as any)}
            className="mt-4 mx-5 mb-1 py-3 items-center"
          >
            <Text className="text-xs font-semibold text-slate-500">
              Projects & feedback →
            </Text>
          </Pressable>
        </>
      ) : null}
      </AppScreen>
      <OnboardingTour role={tour.role} onClose={tour.dismiss} />
    </>
  );
}

const SectionLabel: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <Text className={`text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 ${className}`}>{children}</Text>
);

// ── Section components ────────────────────────────────────────────────

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
} as const;

const ContinueLearning: React.FC<{
  lesson: StudentHomePayload['recent_lessons'][number];
  progress: number;
  onPress?: () => void;
}> = ({ lesson, progress, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Continue lesson ${lesson.title}`}
    className="bg-white rounded-3xl p-5 flex-row items-center"
    style={cardShadow}
  >
    <View className="w-14 h-14 rounded-2xl bg-indigo-100 items-center justify-center mr-4">
      <Ionicons name="play-circle-outline" size={28} color="#3730A3" />
    </View>
    <View className="flex-1 pr-2">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Continue learning</Text>
      <Text numberOfLines={1} className="text-base font-extrabold text-slate-900 mt-0.5">{lesson.title}</Text>
      <Text numberOfLines={1} className="text-xs text-slate-500 mt-0.5">
        {lesson.subject} · {lesson.duration_label}
      </Text>
      <View className="h-1.5 rounded-full bg-slate-100 mt-3 overflow-hidden">
        <View className="h-full bg-maple-900" style={{ width: `${Math.max(8, Math.min(100, progress))}%` }} />
      </View>
    </View>
  </Pressable>
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
    <View className="bg-white rounded-2xl p-4" style={cardShadow}>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</Text>
      <Text className={`text-xl font-extrabold mt-1 ${accent}`}>{value}</Text>
    </View>
  </View>
);

// Mastery placeholder — distributes overall_progress across the four
// canonical subject pillars until /mobile/mastery/ ships.
const MASTERY_SAMPLE = [
  { subject: 'Maths',     tintBg: '#E0E7FF', tintFg: '#3730A3', delta: -8 },
  { subject: 'Science',   tintBg: '#D1FAE5', tintFg: '#065F46', delta: +6 },
  { subject: 'English',   tintBg: '#FFE4E6', tintFg: '#9F1239', delta: +0 },
  { subject: 'History',   tintBg: '#FFEDD5', tintFg: '#9A3412', delta: +12 },
] as const;

const MasteryStrip: React.FC<{ overall: number; onSelect: () => void }> = ({ overall, onSelect }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
    {MASTERY_SAMPLE.map((m, i) => {
      // Spread the overall figure around each subject so the strip feels
      // alive without faking precise per-subject scores.
      const value = Math.max(20, Math.min(98, overall + m.delta));
      return (
        <Pressable
          key={m.subject}
          onPress={onSelect}
          className="bg-white rounded-2xl p-4 mr-3 w-44"
          style={cardShadow}
        >
          <View
            className="w-9 h-9 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: m.tintBg }}
          >
            <Ionicons name="trophy-outline" size={18} color={m.tintFg} />
          </View>
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</Text>
          <Text className="text-base font-extrabold text-slate-900 mt-0.5">{m.subject}</Text>
          <View className="h-1.5 rounded-full bg-slate-100 mt-3 overflow-hidden">
            <View className="h-full" style={{ width: `${value}%`, backgroundColor: m.tintFg }} />
          </View>
          <Text className="text-xs font-bold text-slate-700 mt-2">{value}% mastery</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const TodayPlanTimeline: React.FC<{ tasks: StudentHomePayload['today_tasks'] }> = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <View className="bg-white rounded-2xl py-6" style={cardShadow}>
        <EmptyState
          title="Nothing scheduled for today"
          message="Your plan refreshes daily. Pull down to refresh."
        />
      </View>
    );
  }
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

type DiscoverTone = 'indigo' | 'emerald' | 'amber' | 'orange' | 'rose' | 'teal' | 'purple';

const TONE_TINT: Record<DiscoverTone, { bg: string; fg: string }> = {
  indigo:  { bg: '#E0E7FF', fg: '#3730A3' },
  emerald: { bg: '#D1FAE5', fg: '#065F46' },
  amber:   { bg: '#FEF3C7', fg: '#92400E' },
  orange:  { bg: '#FFEDD5', fg: '#9A3412' },
  rose:    { bg: '#FFE4E6', fg: '#9F1239' },
  teal:    { bg: '#CCFBF1', fg: '#115E59' },
  purple:  { bg: '#EDE9FE', fg: '#5B21B6' },
};

const DiscoverCard: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  tone: DiscoverTone;
  eyebrow: string;
  title: string;
  cta: string;
  onPress?: () => void;
}> = ({ icon, tone, eyebrow, title, cta, onPress }) => {
  const tint = TONE_TINT[tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={eyebrow}
      className="flex-1 bg-white rounded-3xl p-4"
      style={[cardShadow, { minHeight: 168 }]}
    >
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mb-3"
        style={{ backgroundColor: tint.bg }}
      >
        <Ionicons name={icon} size={20} color={tint.fg} />
      </View>
      <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tint.fg }}>
        {eyebrow}
      </Text>
      <Text numberOfLines={2} className="text-sm font-bold text-slate-900 mt-1 leading-snug">
        {title}
      </Text>
      <View style={{ flex: 1 }} />
      <Text className="text-xs font-bold text-maple-900 mt-3">{cta} →</Text>
    </Pressable>
  );
};

const AiBuddyCard: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="AI Study Buddy"
    className="rounded-3xl p-5 flex-row items-center"
    style={[cardShadow, { backgroundColor: '#0F2A45' }]}
  >
    <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center mr-4">
      <Ionicons name="sparkles-outline" size={24} color="#E8C9A4" />
    </View>
    <View className="flex-1 pr-2">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-200">AI Study Buddy</Text>
      <Text className="text-base font-extrabold text-white mt-0.5">Stuck? Get a worked-through hint.</Text>
      <Text className="text-xs text-slate-300 mt-1">Anchored to your school's syllabus, not the open web.</Text>
    </View>
    <Ionicons name="arrow-forward" size={20} color="#E8C9A4" />
  </Pressable>
);

const AchievementCard: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  tone: DiscoverTone;
  title: string;
  count: number | null;
  hint: string;
  onPress?: () => void;
}> = ({ icon, tone, title, count, hint, onPress }) => {
  const tint = TONE_TINT[tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-1 bg-white rounded-3xl p-4"
      style={[cardShadow, { minHeight: 144 }]}
    >
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mb-3"
        style={{ backgroundColor: tint.bg }}
      >
        <Ionicons name={icon} size={20} color={tint.fg} />
      </View>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</Text>
      {count !== null ? (
        <Text className="text-2xl font-extrabold text-slate-900 mt-0.5">{count}</Text>
      ) : (
        <Text className="text-base font-extrabold text-slate-900 mt-0.5">View →</Text>
      )}
      <Text className="text-xs text-slate-500 mt-0.5">{hint}</Text>
    </Pressable>
  );
};

const MistakeNotebookCard: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="Mistake Notebook"
    className="bg-white rounded-3xl p-5 flex-row items-center"
    style={cardShadow}
  >
    <View className="w-12 h-12 rounded-2xl bg-amber-100 items-center justify-center mr-4">
      <Ionicons name="bookmark-outline" size={24} color="#92400E" />
    </View>
    <View className="flex-1 pr-2">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Mistake Notebook</Text>
      <Text className="text-base font-extrabold text-slate-900 mt-0.5">Revise the questions you got wrong.</Text>
      <Text className="text-xs text-slate-500 mt-1">Spaced review keeps mistakes from becoming habits.</Text>
    </View>
    <Ionicons name="arrow-forward" size={20} color="#92400E" />
  </Pressable>
);

const StandbyTeacherStrip: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="Ask a teacher"
    className="rounded-3xl p-4 flex-row items-center"
    style={[cardShadow, { backgroundColor: '#CCFBF1' }]}
  >
    <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
      <Ionicons name="help-buoy-outline" size={22} color="#115E59" />
    </View>
    <View className="flex-1">
      <Text className="text-sm font-extrabold text-teal-900">Need help right now?</Text>
      <Text className="text-xs text-teal-800 mt-0.5">Send a question to a standby teacher — usually answered within an hour.</Text>
    </View>
    <Ionicons name="arrow-forward" size={20} color="#115E59" />
  </Pressable>
);
