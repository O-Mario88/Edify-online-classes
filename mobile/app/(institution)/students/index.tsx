import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import {
  institutionMatchApi,
  type MatchLane,
  type RecommendedStudentCard,
  type RecommendedStudentsResponse,
} from '@/api/institutionMatch.api';

interface ApiError {
  status?: number;
  message?: string;
  /** Set when the 403 was tier-related rather than trust-related. */
  tier_required?: 'pro' | 'premium';
  current_tier?: string;
}

/**
 * Institution Student Match Pipeline — recommended learners list with
 * filter chips and search. Server applies the trust + activity gate;
 * this surface renders the gate-locked state when the institution
 * isn't yet eligible to view matches.
 */
export default function InstitutionStudentMatchScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [response, setResponse] = useState<RecommendedStudentsResponse | null>(null);

  const [lane, setLane] = useState<MatchLane | undefined>(undefined);
  const [region, setRegion] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [scholarshipOnly, setScholarshipOnly] = useState(false);

  const reload = async () => {
    setError(null);
    const { data, error: err } = await institutionMatchApi.recommendedStudents({
      lane,
      region: region || undefined,
      class_level: classLevel || undefined,
      scholarship_only: scholarshipOnly || undefined,
    });
    setLoading(false);
    if (err) {
      const body = (err.detail as Record<string, any> | undefined) || {};
      setError({
        status: err.status,
        message: err.message,
        tier_required: body?.tier_required,
        current_tier: body?.current_tier,
      });
      return;
    }
    setResponse(data);
  };

  useEffect(() => {
    setLoading(true);
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lane, region, classLevel, scholarshipOnly]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">School Match</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Recommended learners</Text>
        <Text className="text-sm text-slate-600 mt-1 leading-relaxed">
          Anonymised profiles of learners whose parents have opted in and who clear our two-lane
          eligibility gate. Identity stays hidden until the parent accepts your invitation.
        </Text>
      </View>

      {loading ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : error ? (
        error.status === 403 ? (
          <GateLockedCard
            message={error.message}
            tierRequired={error.tier_required}
            onUpgrade={() => router.push('/(institution)/upgrade' as any)}
            onSettings={() => router.push('/(institution)/profile' as any)}
          />
        ) : (
          <View className="px-5"><ErrorState onRetry={onRefresh} message={error.message} /></View>
        )
      ) : !response ? null : (
        <>
          {/* Filters */}
          <View className="pl-5 mb-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20, gap: 8 }}>
              <FilterChip label="All" active={!lane} onPress={() => setLane(undefined)} />
              <FilterChip label="High performers" active={lane === 'high_performer'} onPress={() => setLane('high_performer')} />
              <FilterChip label="Fast improvers" active={lane === 'high_growth'} onPress={() => setLane('high_growth')} />
              <FilterChip
                label="Scholarship-eligible"
                active={scholarshipOnly}
                onPress={() => setScholarshipOnly((v) => !v)}
              />
            </ScrollView>
          </View>

          <View className="px-5 mb-3 flex-row" style={{ gap: 8 }}>
            <View className="flex-1 flex-row items-center bg-white rounded-full px-3 py-1.5" style={cardShadow}>
              <Ionicons name="location-outline" size={14} color="#94A3B8" />
              <TextInput
                value={region}
                onChangeText={setRegion}
                placeholder="Region"
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2 text-sm text-slate-900"
              />
            </View>
            <View className="flex-1 flex-row items-center bg-white rounded-full px-3 py-1.5" style={cardShadow}>
              <Ionicons name="school-outline" size={14} color="#94A3B8" />
              <TextInput
                value={classLevel}
                onChangeText={setClassLevel}
                placeholder="Class (P6, S3...)"
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2 text-sm text-slate-900"
              />
            </View>
          </View>

          {/* Counter + invite-readiness pill */}
          <View className="px-5 mb-3 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {response.count} learner{response.count === 1 ? '' : 's'}
            </Text>
            {!response.can_send_invitations && (
              <View className="px-2 py-0.5 rounded-full bg-amber-100">
                <Text className="text-[10px] font-bold text-amber-800">VIEW ONLY</Text>
              </View>
            )}
          </View>

          <View className="px-5">
            {response.students.length === 0 ? (
              <EmptyState
                title="No matches yet"
                message="When learners' parents opt in and they clear the eligibility gate, their anonymised profiles appear here."
              />
            ) : (
              response.students.map((s) => (
                <StudentCard
                  key={String(s.student_id)}
                  s={s}
                  onPress={() => router.push(`/(institution)/students/${s.student_id}` as any)}
                />
              ))
            )}
          </View>
        </>
      )}
    </AppScreen>
  );
}

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

const FilterChip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{ selected: active }}
    style={{
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: active ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: active ? '#0F172A' : '#E2E8F0',
    }}
  >
    <Text style={{ fontSize: 11, fontWeight: '800', color: active ? '#FFFFFF' : '#475569' }}>{label}</Text>
  </Pressable>
);

const StudentCard: React.FC<{ s: RecommendedStudentCard; onPress?: () => void }> = ({ s, onPress }) => {
  const laneTint = s.lane === 'high_performer'
    ? { bg: '#D1FAE5', fg: '#065F46' }
    : { bg: '#FEF3C7', fg: '#92400E' };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open learner ${s.student_id}`}
      className="bg-white rounded-2xl p-4 mb-3"
      style={cardShadow}
    >
      <View className="flex-row items-center mb-2">
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: laneTint.bg }}
        >
          <Ionicons name={s.lane === 'high_performer' ? 'trophy-outline' : 'trending-up-outline'} size={20} color={laneTint.fg} />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: laneTint.fg }}>
            {s.lane_label}
          </Text>
          <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900 mt-0.5">
            {s.class_level} · {s.region || s.country || 'Region pending'}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-base font-extrabold text-slate-900">{Math.round(s.overall_readiness_score)}</Text>
          <Text className="text-[10px] text-slate-500">readiness</Text>
        </View>
      </View>

      <View className="flex-row items-center mt-1" style={{ gap: 8 }}>
        <Pill label={`Avg ${s.average_score_pct.toFixed(0)}%`} tint="emerald" />
        {s.improvement_pct_6w >= 5 && (
          <Pill label={`+${s.improvement_pct_6w.toFixed(0)} pp / 6w`} tint="indigo" />
        )}
        <Pill label={`Activity ${Math.round(s.signals.activity)}`} tint="navy" />
      </View>

      {!!s.curriculum && (
        <Text className="text-[11px] text-slate-500 mt-2">Curriculum: {s.curriculum}</Text>
      )}
    </Pressable>
  );
};

const Pill: React.FC<{ label: string; tint: 'navy' | 'emerald' | 'indigo' }> = ({ label, tint }) => {
  const palette = {
    navy:    { bg: '#E2E8F0', fg: '#0F172A' },
    emerald: { bg: '#D1FAE5', fg: '#065F46' },
    indigo:  { bg: '#E0E7FF', fg: '#3730A3' },
  }[tint];
  return (
    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: palette.bg }}>
      <Text className="text-[10px] font-bold" style={{ color: palette.fg }}>{label}</Text>
    </View>
  );
};

const GateLockedCard: React.FC<{
  message?: string;
  tierRequired?: 'pro' | 'premium';
  onUpgrade: () => void;
  onSettings: () => void;
}> = ({ message, tierRequired, onUpgrade, onSettings }) => {
  // Tier-required errors get the navy "Upgrade to Pro" treatment;
  // trust-required errors get the amber "Complete profile" treatment.
  const tierMode = !!tierRequired;
  return tierMode ? (
    <View className="px-5">
      <View
        className="rounded-3xl p-5"
        style={{ backgroundColor: '#0F2A45', elevation: 4, shadowColor: '#0F172A', shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } }}
      >
        <View className="flex-row items-center mb-2">
          <View className="w-10 h-10 rounded-2xl bg-white/10 items-center justify-center mr-3">
            <Ionicons name="sparkles-outline" size={20} color="#E8C9A4" />
          </View>
          <Text className="text-base font-extrabold text-white">
            Unlock School Match {tierRequired === 'premium' ? 'Premium' : 'Pro'}
          </Text>
        </View>
        <Text className="text-sm text-slate-200 leading-relaxed">
          {message || 'Pro and Premium plans unlock recommended-learner discovery, invitations, and Passport requests.'}
        </Text>
        <Pressable
          onPress={onUpgrade}
          className="mt-4 self-start px-5 py-2.5 rounded-full"
          style={{ backgroundColor: '#E8C9A4' }}
        >
          <Text className="text-xs font-bold" style={{ color: '#0F2A45' }}>
            View plans
          </Text>
        </Pressable>
      </View>
    </View>
  ) : (
    <LegacyGateLockedCard message={message} onSettings={onSettings} />
  );
};

const LegacyGateLockedCard: React.FC<{ message?: string; onSettings: () => void }> = ({ message, onSettings }) => (
  <View className="px-5">
    <View
      className="rounded-3xl p-5"
      style={{ backgroundColor: '#FEF3C7', elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
    >
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mr-3">
          <Ionicons name="lock-closed-outline" size={20} color="#92400E" />
        </View>
        <Text className="text-base font-extrabold text-amber-900">School Match locked</Text>
      </View>
      <Text className="text-sm text-amber-900 leading-relaxed">
        {message || 'Your institution doesn\'t yet meet School Match requirements.'}
      </Text>
      <Text className="text-xs text-amber-800 mt-3 leading-relaxed">
        Verify your school, complete admission settings, and keep your activity score above 70 to
        view recommended learners. Maple checks this nightly.
      </Text>
      <Pressable
        onPress={onSettings}
        className="mt-4 self-start px-4 py-2 rounded-full bg-amber-900"
      >
        <Text className="text-xs font-bold text-white">Open profile settings</Text>
      </Pressable>
    </View>
  </View>
);
