import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useApiQuery } from '@/hooks/useApiQuery';
import { teacherApi, type EarningsSummary } from '@/api/teacher.api';

/**
 * Earnings & payouts. Shows the month total, what's pending payout,
 * and the activity counts that drove it. The dedicated earnings
 * endpoint is still TBD on the backend; for now the API client
 * returns a zeroed shape so the screen renders an honest empty state
 * with a clear call-to-action to complete the payout profile.
 */
export default function TeacherEarningsTab() {
  const [refreshing, setRefreshing] = useState(false);
  const query = useApiQuery<EarningsSummary>(
    ['teacher-earnings'],
    () => teacherApi.earnings(),
    { staleTime: 5 * 60_000 },
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
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Earnings</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Earnings & payouts</Text>
        <Text className="text-sm text-slate-600 mt-1">
          What you've earned this month, what's pending, and how you'll be paid.
        </Text>
      </View>

      {!data ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : (
        <>
          {/* Hero — month + pending payout */}
          <View className="px-5">
            <View className="rounded-3xl p-5" style={[cardShadow, { backgroundColor: '#0F2A45' }]}>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-200">This month</Text>
              <Text className="text-3xl font-extrabold text-white mt-1" style={{ letterSpacing: -0.5 }}>
                {data.currency} {data.this_month.toLocaleString()}
              </Text>
              <View className="mt-4 flex-row items-center pt-3 border-t border-white/15">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Pending payout</Text>
                  <Text className="text-base font-extrabold text-white mt-0.5">
                    {data.currency} {data.pending_payout.toLocaleString()}
                  </Text>
                </View>
                <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: '#E8C9A4' }}>
                  <Text className="text-[11px] font-bold" style={{ color: '#0F2A45' }}>
                    {data.payout_profile_status === 'verified' ? 'On track' : 'Action needed'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Activity breakdown */}
          <View className="px-5 mt-7">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Activity this month
            </Text>
            <View className="flex-row -mx-1.5">
              <ActivityTile label="Reviews"     value={data.paid_reviews}        icon="checkmark-done-outline" tintBg="#E0E7FF" tintFg="#3730A3" />
              <ActivityTile label="Live classes" value={data.paid_classes}       icon="videocam-outline"       tintBg="#D1FAE5" tintFg="#065F46" />
              <ActivityTile label="Enrollments" value={data.course_enrollments} icon="people-outline"          tintBg="#FFEDD5" tintFg="#9A3412" />
            </View>
          </View>

          {/* Payout profile reminder */}
          {data.payout_profile_status !== 'verified' && (
            <View className="px-5 mt-7">
              <View className="rounded-3xl p-4 flex-row items-start" style={{ backgroundColor: '#FEF3C7' }}>
                <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mr-3">
                  <Ionicons name="alert-circle-outline" size={20} color="#92400E" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-extrabold text-amber-900">Complete your payout profile</Text>
                  <Text className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Add a mobile-money or bank account so we can release earnings every Friday.
                  </Text>
                  <Pressable className="mt-3 self-start px-3 py-1.5 rounded-full bg-amber-900">
                    <Text className="text-[11px] font-bold text-white">Add payout method</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* What earnings include */}
          <View className="px-5 mt-7 mb-2">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              What earnings include
            </Text>
            <View className="bg-white rounded-3xl p-5" style={cardShadow}>
              <Bullet text="Project reviews and essay marking on the standby network." />
              <Bullet text="Live paid classes you teach to your storefront audience." />
              <Bullet text="Course enrollments — full payout when a learner completes the first module." />
              <Bullet text="Mentor-review subscriptions paid by parents." />
              <Text className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                Maple platform fee is applied per the teacher agreement. Statements are downloadable from the web portal until the mobile statements feature ships.
              </Text>
            </View>
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

const ActivityTile: React.FC<{
  label: string; value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tintBg: string; tintFg: string;
}> = ({ label, value, icon, tintBg, tintFg }) => (
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
      <View
        className="w-9 h-9 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: tintBg }}
      >
        <Ionicons name={icon} size={16} color={tintFg} />
      </View>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</Text>
      <Text className="text-xl font-extrabold text-slate-900 mt-0.5">{value}</Text>
    </View>
  </View>
);

const Bullet: React.FC<{ text: string }> = ({ text }) => (
  <View className="flex-row items-start mb-2.5">
    <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 mr-2.5" />
    <Text className="flex-1 text-sm text-slate-700 leading-relaxed">{text}</Text>
  </View>
);
