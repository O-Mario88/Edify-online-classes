import React, { useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { TodayHero } from '@/components/TodayHero';
import { ChildSelector } from '@/components/ChildSelector';
import { WeeklyBriefCard } from '@/components/WeeklyBriefCard';
import { PassportPreviewCard } from '@/components/PassportPreviewCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { QuickActionGrid, type QuickAction } from '@/components/QuickActionGrid';
import { ProfileHeader, HomeHero } from '@/components/ProfileHeader';
import { useApiQuery } from '@/hooks/useApiQuery';
import { parentApi, type ParentHomePayload } from '@/api/parent.api';
import { useAuthStore } from '@/auth/authStore';
import { useParentStore } from '@/auth/parentStore';
import { OnboardingTour } from '@/components/OnboardingTour';
import { useOnboardingTour } from '@/onboarding/useOnboardingTour';

/**
 * Parent home — "understand my child's progress in under one minute"
 * surface, plus a row of quick actions for the seven things parents
 * actually need to do quickly: message a teacher, nudge their child,
 * download a report, top up the subscription, peek at weak topics,
 * book a support session, or start a school application.
 *
 * Layout, top → bottom:
 *   1. Greeting + child selector
 *   2. Today hero
 *   3. Quick actions (7 tiles)
 *   4. Weekly Brief (with WhatsApp share)
 *   5. KPI strip
 *   6. Teacher Support summary
 *   7. Passport preview (with WhatsApp share)
 *
 * All blocks read off the single /mobile/parent-home/ aggregator.
 */
export default function ParentHome() {
  const router = useRouter();
  const parentUser = useAuthStore((s) => s.user);
  const selectedChildId = useParentStore((s) => s.selectedChildId);
  const setSelectedChildId = useParentStore((s) => s.setSelectedChildId);
  const tour = useOnboardingTour('parent');
  const [refreshing, setRefreshing] = useState(false);

  const homeQuery = useApiQuery<ParentHomePayload>(
    ['parent-home', selectedChildId],
    () => parentApi.home(selectedChildId ?? undefined),
    { staleTime: 60_000 },
  );

  useEffect(() => {
    if (selectedChildId == null && homeQuery.data?.selected_child) {
      setSelectedChildId(homeQuery.data.selected_child.id);
    }
  }, [homeQuery.data?.selected_child, selectedChildId, setSelectedChildId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await homeQuery.refetch();
    setRefreshing(false);
  };

  const data = homeQuery.data;
  const firstName = (parentUser?.full_name || data?.parent?.full_name || 'there').split(' ')[0];
  const child = data?.selected_child ?? null;
  const childFirstName = child?.name?.split(' ')[0] || 'your child';

  // Six primary actions in a 2x3 grid (the apply / support / weak-topics
  // surfaces are also linked from the weekly brief card and the school-
  // match section, but having them one tap away from the home is worth
  // the extra row).
  const quickActions = useMemo<QuickAction[]>(() => [
    { key: 'message', label: 'Message', glyph: '💬', tint: 'indigo',  onPress: () => router.push('/(parent)/messages' as any) },
    { key: 'remind',  label: 'Remind',  glyph: '🔔', tint: 'amber',   onPress: () => router.push('/(parent)/remind' as any) },
    { key: 'pay',     label: 'Pay',     glyph: '💳', tint: 'emerald', onPress: () => router.push('/(parent)/pay' as any) },
    { key: 'reports', label: 'Reports', glyph: '📄', tint: 'purple',  onPress: () => router.push('/(parent)/reports' as any) },
    { key: 'support', label: 'Support', glyph: '🤝', tint: 'teal',    onPress: () => router.push('/(parent)/support' as any) },
    { key: 'apply',   label: 'Apply',   glyph: '🏫', tint: 'orange',  onPress: () => router.push('/(parent)/apply' as any) },
  ], [router]);

  return (
    <>
      <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <ProfileHeader name={firstName} />
      <HomeHero
        eyebrow="Hi,"
        name={firstName}
        emoji="👋"
        subtitle={child ? `${childFirstName}'s week` : 'Family overview'}
      />

      <View className="px-5">
        {homeQuery.isLoading && !data ? (
          <LoadingSkeleton height={140} lines={3} />
        ) : homeQuery.isError ? (
          <ErrorState onRetry={() => homeQuery.refetch()} />
        ) : data ? (
          <View style={{ gap: 20 }}>
            <TodayHero payload={data.today} />

            {data.children.length > 0 ? (
              <ChildSelector
                children={data.children}
                selectedId={child?.id ?? null}
                onSelect={(c) => setSelectedChildId(c.id)}
              />
            ) : (
              <EmptyState
                title="No child linked yet"
                message="Once your child's school links you to their account, you'll see their progress here."
              />
            )}
          </View>
        ) : null}
      </View>

      {data && (
        <View className="mt-5 px-5">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Quick actions</Text>
          <QuickActionGrid actions={quickActions} />
        </View>
      )}

      <View className="px-5 mt-2">
        {data && child && (
          <View style={{ gap: 20 }} className="mt-3">
            <WeeklyBriefCard brief={child.weekly_brief} childFirstName={childFirstName} />
            <KpiStrip kpis={child.kpis} childFirstName={childFirstName} />
            <TeacherSupportCard
              answered={child.teacher_support.questions_answered}
              pending={child.teacher_support.pending_requests}
            />
            <PassportPreviewCard passport={child.passport} childFirstName={childFirstName} />
          </View>
        )}
      </View>
      </AppScreen>
      <OnboardingTour role={tour.role} onClose={tour.dismiss} />
    </>
  );
}

const KpiStrip: React.FC<{
  kpis: NonNullable<ParentHomePayload['selected_child']>['kpis'];
  childFirstName: string;
}> = ({ kpis, childFirstName }) => (
  <View>
    <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
      {childFirstName}'s standing this term
    </Text>
    <View className="flex-row flex-wrap -mx-1.5">
      <KpiTile label="Progress"   value={`${kpis.overall_progress}%`} accent="text-emerald-700" />
      <KpiTile label="Attendance" value={`${kpis.attendance}%`}       accent={kpis.attendance < 75 ? 'text-rose-600' : 'text-emerald-700'} />
      <KpiTile label="Readiness"  value={`${kpis.exam_readiness}`}    accent="text-indigo-700" />
      <KpiTile label="Overdue"    value={`${kpis.overdue_work}`}      accent={kpis.overdue_work > 0 ? 'text-amber-700' : 'text-emerald-700'} />
    </View>
  </View>
);

const KpiTile: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <View className="w-1/2 px-1.5 mb-3">
    <AppCard className="py-4">
      <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</Text>
      <Text className={`text-2xl font-extrabold mt-1 ${accent}`}>{value}</Text>
    </AppCard>
  </View>
);

const TeacherSupportCard: React.FC<{ answered: number; pending: number }> = ({ answered, pending }) => (
  <AppCard>
    <Text className="text-[11px] font-bold uppercase tracking-wider text-teal-700 mb-1">Teacher support</Text>
    <View className="flex-row mt-2">
      <View className="flex-1">
        <Text className="text-2xl font-extrabold text-slate-900">{answered}</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Questions answered</Text>
      </View>
      <View className="flex-1">
        <Text className={`text-2xl font-extrabold ${pending > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{pending}</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Pending requests</Text>
      </View>
    </View>
  </AppCard>
);
