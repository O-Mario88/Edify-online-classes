import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useApiQuery } from '@/hooks/useApiQuery';
import { institutionApi, type InstitutionHealthSnapshot } from '@/api/institution.api';

/**
 * School Health detail. Hero composite score + per-signal breakdown
 * (attendance / delivery / assessment activity / parent reporting /
 * teacher engagement) + risk count strip + drill-down links.
 */
export default function InstitutionSchoolTab() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const query = useApiQuery<InstitutionHealthSnapshot>(
    ['institution-health'],
    () => institutionApi.health(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const data = query.data;

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">School</Text>
        <Text className="text-2xl font-extrabold text-slate-900">School at a glance</Text>
        <Text className="text-sm text-slate-600 mt-1">
          The composite health score and the five signals it's built from.
        </Text>
      </View>

      {!data ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : (
        <>
          {/* Health hero */}
          <View className="px-5 mt-2">
            <View
              className="rounded-3xl p-5"
              style={[cardShadow, { backgroundColor: '#0F2A45' }]}
            >
              <View className="flex-row items-center">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
                  School Health
                </Text>
                <View className="ml-auto px-2 py-0.5 rounded-full" style={{ backgroundColor: trendBg(data.trend) }}>
                  <Text className="text-[10px] font-bold" style={{ color: trendFg(data.trend) }}>
                    {data.trend.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-baseline mt-2">
                <Text className="text-5xl font-extrabold text-white" style={{ letterSpacing: -1 }}>
                  {data.health_score || '—'}
                </Text>
                <Text className="text-base font-bold text-amber-200 ml-2">/ 100</Text>
              </View>
              <Text className="text-xs text-slate-300 mt-2">
                Composite of attendance, delivery, assessments, parent reporting, and teacher engagement.
              </Text>
            </View>
          </View>

          {/* Signal breakdown */}
          <View className="px-5 mt-7">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Signals
            </Text>
            <SignalRow
              icon="checkmark-done-outline"
              label="Attendance"
              value={data.attendance_pct}
              hint="Daily presence rolled up across classes."
              onPress={() => router.push('/(institution)/school' as any)}
            />
            <SignalRow
              icon="megaphone-outline"
              label="Lesson delivery"
              value={data.delivery_consistency_pct}
              hint="Scheduled lessons that actually ran."
              onPress={() => router.push('/(institution)/teacher-delivery' as any)}
            />
            <SignalRow
              icon="reader-outline"
              label="Assessment activity"
              value={data.assessment_activity_pct}
              hint="Submissions vs. published assessments this week."
            />
            <SignalRow
              icon="people-outline"
              label="Parent reporting"
              value={data.parent_reporting_pct}
              hint="Parents who opened the most recent Weekly Brief."
              onPress={() => router.push('/(institution)/parent-engagement' as any)}
            />
            <SignalRow
              icon="person-circle-outline"
              label="Teacher engagement"
              value={data.teacher_engagement_pct}
              hint="Teachers actively delivering, marking, and answering questions."
            />
          </View>

          {/* Risk strip */}
          <View className="px-5 mt-7 mb-2">
            <Pressable
              onPress={() => router.push('/(institution)/risk' as any)}
              className="rounded-3xl p-4 flex-row items-center"
              style={[cardShadow, {
                backgroundColor: data.active_risk_count > 0 ? '#FFE4E6' : '#D1FAE5',
              }]}
            >
              <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
                <Ionicons
                  name={data.active_risk_count > 0 ? 'warning-outline' : 'shield-checkmark-outline'}
                  size={22}
                  color={data.active_risk_count > 0 ? '#9F1239' : '#065F46'}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-sm font-extrabold"
                  style={{ color: data.active_risk_count > 0 ? '#881337' : '#064E3B' }}
                >
                  {data.active_risk_count > 0
                    ? `${data.active_risk_count} active risk alert${data.active_risk_count === 1 ? '' : 's'}`
                    : 'No active risk alerts'}
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: data.active_risk_count > 0 ? '#9F1239' : '#065F46' }}
                >
                  Drops in attendance, delivery, or engagement land here.
                </Text>
              </View>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={data.active_risk_count > 0 ? '#9F1239' : '#065F46'}
              />
            </Pressable>
          </View>
        </>
      )}
    </AppScreen>
  );
}

const cardShadow = {
  elevation: 2,
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
} as const;

const trendBg = (t: string) => (t === 'improving' ? '#A7F3D0' : t === 'declining' ? '#FECDD3' : '#E2E8F0');
const trendFg = (t: string) => (t === 'improving' ? '#065F46' : t === 'declining' ? '#9F1239' : '#475569');

const SignalRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  hint: string;
  onPress?: () => void;
}> = ({ icon, label, value, hint, onPress }) => {
  const goodColor = value >= 75 ? '#065F46' : value >= 50 ? '#92400E' : '#9F1239';
  const goodBg = value >= 75 ? '#D1FAE5' : value >= 50 ? '#FEF3C7' : '#FFE4E6';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="bg-white rounded-2xl p-4 mb-3"
      style={{
        elevation: 1,
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: goodBg }}
        >
          <Ionicons name={icon} size={18} color={goodColor} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-slate-900">{label}</Text>
          <Text className="text-[11px] text-slate-500 mt-0.5">{hint}</Text>
        </View>
        <Text className="text-base font-extrabold" style={{ color: goodColor }}>{value}%</Text>
      </View>
      <View className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-3">
        <View
          className="h-full"
          style={{ width: `${Math.max(2, Math.min(100, value))}%`, backgroundColor: goodColor }}
        />
      </View>
    </Pressable>
  );
};
