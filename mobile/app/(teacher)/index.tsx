import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { ProfileHeader, HomeHero } from '@/components/ProfileHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { QuickActionGrid, type QuickAction } from '@/components/QuickActionGrid';
import { useApiQuery } from '@/hooks/useApiQuery';
import { teacherApi, type TeacherHomePayload } from '@/api/teacher.api';
import { useAuthStore } from '@/auth/authStore';
import { OnboardingTour } from '@/components/OnboardingTour';
import { useOnboardingTour } from '@/onboarding/useOnboardingTour';

/**
 * Teacher home — the "what needs me today" surface.
 *
 * Sections, top → bottom:
 *   1. ProfileHeader (greeting + role chip + notifications)
 *   2. KPI strip (classes today, pending reviews, unread questions, rating)
 *   3. Quick actions (8 tiles: publish note, grading, questions, etc.)
 *   4. Today's classes preview
 *   5. Earnings strip with "see payout"
 *   6. Standby availability toggle CTA
 *
 * All blocks read from /mobile/teacher-home/ when present; without it
 * the surface still renders with empty / zeroed counters so the
 * navigation graph is fully testable.
 */
export default function TeacherHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tour = useOnboardingTour('teacher');
  const homeQuery = useApiQuery<TeacherHomePayload>(
    ['teacher-home'],
    () => teacherApi.home(),
    { staleTime: 60_000 },
  );

  const data = homeQuery.data;
  const firstName = (user?.full_name || data?.user?.full_name || 'there').split(' ')[0];
  const kpis = data?.kpis ?? {
    classes_today: 0,
    pending_reviews: 0,
    student_questions: 0,
    earnings_this_week: 0,
    payout_pending: 0,
    rating: 0,
  };

  // Six primary teacher actions in a 2x3 grid. Today and Earnings are
  // already on the bottom tab bar; Reviews has its own tab; so those
  // don't need to duplicate here.
  const actions = useMemo<QuickAction[]>(() => [
    { key: 'note',      label: 'Publish note', glyph: '📝', tint: 'indigo',  onPress: () => router.push('/(teacher)/quick-note' as any) },
    { key: 'grading',   label: 'Grading',      glyph: '✅', tint: 'emerald', onPress: () => router.push('/(teacher)/grading' as any), badge: kpis.pending_reviews },
    { key: 'questions', label: 'Questions',    glyph: '🙋', tint: 'amber',   onPress: () => router.push('/(teacher)/questions' as any), badge: kpis.student_questions },
    { key: 'standby',   label: 'Standby',      glyph: '🟢', tint: 'teal',    onPress: () => router.push('/(teacher)/availability' as any) },
    { key: 'shop',      label: 'Storefront',   glyph: '🏪', tint: 'orange',  onPress: () => router.push('/(teacher)/storefront' as any) },
    { key: 'upgrade',   label: 'Upgrade',      glyph: '✨', tint: 'purple',  onPress: () => router.push('/(teacher)/upgrade' as any) },
  ], [router, kpis.pending_reviews, kpis.student_questions]);

  return (
    <>
      <AppScreen>
      <ProfileHeader
        name={firstName}
        unreadCount={kpis.student_questions || 0}
        onNotificationsPress={() => router.push('/(teacher)/notifications' as any)}
      />
      <HomeHero
        eyebrow="Welcome back,"
        name={firstName}
        emoji="👋"
        subtitle="Teaching · Maple"
      />

      <View className="px-5 mt-3">
        <SectionLabel>Today at a glance</SectionLabel>
        <View className="flex-row -mx-1.5">
          <KpiTile label="Classes"  value={`${kpis.classes_today}`}    accent="text-indigo-700" />
          <KpiTile label="Reviews"  value={`${kpis.pending_reviews}`}  accent={kpis.pending_reviews > 0 ? 'text-amber-700' : 'text-emerald-700'} />
          <KpiTile label="Questions" value={`${kpis.student_questions}`} accent={kpis.student_questions > 0 ? 'text-amber-700' : 'text-emerald-700'} />
          <KpiTile label="Rating"   value={`${kpis.rating ? kpis.rating.toFixed(1) : '—'}`} accent="text-emerald-700" />
        </View>
      </View>

      <View className="mt-7 px-5">
        <SectionLabel>Quick actions</SectionLabel>
        <QuickActionGrid actions={actions} />
      </View>

      <View className="px-5 mt-7">
        <View className="flex-row items-end justify-between mb-3">
          <SectionLabel className="mb-0">Today's classes</SectionLabel>
          <Pressable onPress={() => router.push('/(teacher)/today' as any)}>
            <Text className="text-xs font-bold text-maple-900">All →</Text>
          </Pressable>
        </View>
        {(data?.today_classes || []).length === 0 ? (
          <View className="bg-white rounded-2xl p-5" style={cardShadow}>
            <Text className="text-sm text-slate-600 text-center">
              No live classes scheduled today.
            </Text>
          </View>
        ) : (
          (data!.today_classes).slice(0, 3).map((c) => <TodayClassRow key={c.id} cls={c} />)
        )}
      </View>

      <View className="px-5 mt-7">
        <Pressable
          onPress={() => router.push('/(teacher)/earnings' as any)}
          accessibilityRole="button"
          accessibilityLabel="View earnings"
          className="rounded-3xl p-5 flex-row items-center"
          style={[cardShadow, { backgroundColor: '#0F2A45' }]}
        >
          <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center mr-4">
            <Ionicons name="wallet-outline" size={24} color="#E8C9A4" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-200">This week</Text>
            <Text className="text-base font-extrabold text-white mt-0.5">
              UGX {kpis.earnings_this_week.toLocaleString()} earned
            </Text>
            <Text className="text-xs text-slate-300 mt-0.5">
              {kpis.payout_pending > 0
                ? `Pending payout: UGX ${kpis.payout_pending.toLocaleString()}`
                : 'No payout pending — clean week.'}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#E8C9A4" />
        </Pressable>
      </View>

      <View className="px-5 mt-7 mb-2">
        <Pressable
          onPress={() => router.push('/(teacher)/availability' as any)}
          accessibilityRole="button"
          accessibilityLabel="Set standby availability"
          className="rounded-3xl p-4 flex-row items-center"
          style={[cardShadow, { backgroundColor: '#CCFBF1' }]}
        >
          <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
            <Ionicons name="radio-outline" size={22} color="#115E59" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-teal-900">Set standby availability</Text>
            <Text className="text-xs text-teal-800 mt-0.5">
              Let learners know when you can answer questions in real time.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#115E59" />
        </Pressable>
      </View>
      </AppScreen>
      <OnboardingTour role={tour.role} onClose={tour.dismiss} />
    </>
  );
}

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
} as const;

const SectionLabel: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <Text className={`text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 ${className}`}>{children}</Text>
);

const KpiTile: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <View className="flex-1 px-1.5">
    <View className="bg-white rounded-2xl p-4" style={cardShadow}>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</Text>
      <Text className={`text-xl font-extrabold mt-1 ${accent}`}>{value}</Text>
    </View>
  </View>
);

const TodayClassRow: React.FC<{ cls: NonNullable<TeacherHomePayload['today_classes']>[number] }> = ({ cls }) => (
  <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center" style={cardShadow}>
    <View className="w-11 h-11 rounded-2xl bg-blue-100 items-center justify-center mr-3">
      <Ionicons name="videocam-outline" size={20} color="#1E40AF" />
    </View>
    <View className="flex-1">
      <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">{cls.title}</Text>
      <Text className="text-xs text-slate-500 mt-0.5">
        {cls.subject} · {cls.duration_minutes} min · {cls.student_count} student{cls.student_count === 1 ? '' : 's'}
      </Text>
    </View>
    <Text className="text-[11px] font-bold text-blue-800">
      {new Date(cls.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Text>
  </View>
);
