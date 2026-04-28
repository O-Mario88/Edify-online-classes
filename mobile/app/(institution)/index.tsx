import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { ProfileHeader, HomeHero } from '@/components/ProfileHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { QuickActionGrid, type QuickAction } from '@/components/QuickActionGrid';
import { useApiQuery } from '@/hooks/useApiQuery';
import { institutionApi, type InstitutionHomePayload } from '@/api/institution.api';
import { useAuthStore } from '@/auth/authStore';
import { OnboardingTour } from '@/components/OnboardingTour';
import { useOnboardingTour } from '@/onboarding/useOnboardingTour';

/**
 * Institution dashboard — head-teacher / DOS view of how the school is
 * running today.
 *
 * Sections, top → bottom:
 *   1. ProfileHeader (name + school name + notifications)
 *   2. School Health Score — large hero card
 *   3. KPI strip (attendance, teacher delivery, parent engagement, risk)
 *   4. Quick actions (8 tiles)
 *   5. Risk alerts strip
 *   6. Admission Interest Inbox preview
 *   7. Reports preview link
 *
 * Reads from /mobile/institution-home/ when present; otherwise renders
 * with zeroed counters so the navigation graph is exercisable today.
 */
export default function InstitutionHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tour = useOnboardingTour('institution_admin');
  const homeQuery = useApiQuery<InstitutionHomePayload>(
    ['institution-home'],
    () => institutionApi.home(),
    { staleTime: 60_000 },
  );

  const data = homeQuery.data;
  const firstName = (user?.full_name || data?.user?.full_name || 'there').split(' ')[0];
  const schoolName = data?.institution?.name || 'Your school';
  const kpis = data?.kpis ?? {
    health_score: 0,
    attendance: 0,
    teacher_delivery: 0,
    parent_engagement: 0,
    risk_alerts: 0,
    applications_inbox: 0,
  };
  const healthLabel =
    kpis.health_score >= 80 ? 'Healthy' : kpis.health_score >= 60 ? 'Watch' : kpis.health_score > 0 ? 'Action needed' : '—';
  const healthColor =
    kpis.health_score >= 80 ? '#065F46' : kpis.health_score >= 60 ? '#92400E' : kpis.health_score > 0 ? '#9F1239' : '#64748B';

  // Six primary institution actions in a 2x3 grid. The four KPI surfaces
  // (Attendance / Delivery / Engagement / Risk) are already drillable
  // from the KPI strip above, so they don't need to be quick-action tiles.
  // School + Reports + Admissions sit on the bottom tab bar.
  const actions = useMemo<QuickAction[]>(() => [
    { key: 'risk',         label: 'Risk',         glyph: '🚨', tint: 'rose',    onPress: () => router.push('/(institution)/risk' as any), badge: kpis.risk_alerts },
    { key: 'reviewapp',    label: 'Review',       glyph: '🗂️', tint: 'teal',    onPress: () => router.push('/(institution)/application-review' as any), badge: kpis.applications_inbox },
    { key: 'students',     label: 'Match',        glyph: '🎯', tint: 'indigo',  onPress: () => router.push('/(institution)/students' as any) },
    { key: 'scholarships', label: 'Scholarships', glyph: '🎓', tint: 'amber',   onPress: () => router.push('/(institution)/scholarships' as any) },
    { key: 'engagement',   label: 'Parents',      glyph: '💬', tint: 'purple',  onPress: () => router.push('/(institution)/parent-engagement' as any) },
    { key: 'delivery',     label: 'Teaching',     glyph: '📚', tint: 'emerald', onPress: () => router.push('/(institution)/teacher-delivery' as any) },
  ], [router, kpis.risk_alerts, kpis.applications_inbox]);

  return (
    <>
      <AppScreen>
      <ProfileHeader
        name={firstName}
        unreadCount={kpis.risk_alerts || 0}
        onNotificationsPress={() => router.push('/(institution)/notifications' as any)}
      />
      <HomeHero
        eyebrow="Good morning,"
        name={firstName}
        emoji="👋"
        subtitle={schoolName}
      />

      {/* Health Score hero */}
      <View className="px-5 mt-3">
        <Pressable
          onPress={() => router.push('/(institution)/school' as any)}
          className="rounded-3xl p-5 flex-row items-center"
          style={[cardShadow, { backgroundColor: '#0F2A45' }]}
        >
          <View className="w-16 h-16 rounded-3xl bg-white/10 items-center justify-center mr-4">
            <Text className="text-2xl font-extrabold text-white">{kpis.health_score || '—'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-200">School Health</Text>
            <Text className="text-base font-extrabold text-white mt-0.5">{healthLabel}</Text>
            <Text className="text-xs text-slate-300 mt-1">
              Composite of attendance, delivery, engagement, and risk signals.
            </Text>
          </View>
          <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: healthColor }}>
            <Text className="text-[11px] font-bold text-white">{kpis.health_score}/100</Text>
          </View>
        </Pressable>
      </View>

      {/* KPI strip */}
      <View className="px-5 mt-6">
        <SectionLabel>Today</SectionLabel>
        <View className="flex-row -mx-1.5">
          <KpiTile label="Attendance" value={`${kpis.attendance}%`}        accent={kpis.attendance >= 75 ? 'text-emerald-700' : 'text-amber-700'} />
          <KpiTile label="Delivery"   value={`${kpis.teacher_delivery}%`}  accent={kpis.teacher_delivery >= 80 ? 'text-emerald-700' : 'text-amber-700'} />
          <KpiTile label="Parents"    value={`${kpis.parent_engagement}%`} accent="text-indigo-700" />
          <KpiTile label="Risk"       value={`${kpis.risk_alerts}`}        accent={kpis.risk_alerts > 0 ? 'text-rose-700' : 'text-emerald-700'} />
        </View>
      </View>

      {/* Quick actions */}
      <View className="mt-7 px-5">
        <SectionLabel>Quick actions</SectionLabel>
        <QuickActionGrid actions={actions} />
      </View>

      {/* Risk alerts strip */}
      <View className="px-5 mt-7">
        <Pressable
          onPress={() => router.push('/(institution)/risk' as any)}
          className="rounded-3xl p-4 flex-row items-center"
          style={[cardShadow, { backgroundColor: kpis.risk_alerts > 0 ? '#FFE4E6' : '#D1FAE5' }]}
        >
          <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
            <Ionicons
              name={kpis.risk_alerts > 0 ? 'warning-outline' : 'shield-checkmark-outline'}
              size={22}
              color={kpis.risk_alerts > 0 ? '#9F1239' : '#065F46'}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold" style={{ color: kpis.risk_alerts > 0 ? '#881337' : '#064E3B' }}>
              {kpis.risk_alerts > 0
                ? `${kpis.risk_alerts} risk alert${kpis.risk_alerts === 1 ? '' : 's'} need attention`
                : 'No active risk alerts'}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: kpis.risk_alerts > 0 ? '#9F1239' : '#065F46' }}>
              Drops in attendance, delivery, or engagement surface here.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={kpis.risk_alerts > 0 ? '#9F1239' : '#065F46'} />
        </Pressable>
      </View>

      {/* Admissions inbox */}
      <View className="px-5 mt-7 mb-2">
        <Pressable
          onPress={() => router.push('/(institution)/admissions' as any)}
          className="rounded-3xl p-4 flex-row items-center"
          style={[cardShadow, { backgroundColor: '#FFEDD5' }]}
        >
          <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
            <Ionicons name="mail-open-outline" size={22} color="#9A3412" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-orange-900">
              {kpis.applications_inbox > 0
                ? `${kpis.applications_inbox} new admission ${kpis.applications_inbox === 1 ? 'enquiry' : 'enquiries'}`
                : 'Admission Interest Inbox'}
            </Text>
            <Text className="text-xs text-orange-800 mt-0.5">
              Families enquiring about a place at {schoolName}.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#9A3412" />
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

const SectionLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">{children}</Text>
);

const KpiTile: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <View className="flex-1 px-1.5">
    <View className="bg-white rounded-2xl p-4" style={cardShadow}>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</Text>
      <Text className={`text-xl font-extrabold mt-1 ${accent}`}>{value}</Text>
    </View>
  </View>
);
