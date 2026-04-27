import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { schoolMatchApi, type AdmissionApplication } from '@/api/schoolMatch.api';

const STATUS_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  draft:        { bg: '#FEF3C7', fg: '#92400E', label: 'Draft' },
  submitted:    { bg: '#E0E7FF', fg: '#3730A3', label: 'Submitted' },
  reviewing:    { bg: '#E0E7FF', fg: '#3730A3', label: 'Under review' },
  shortlisted:  { bg: '#FEF3C7', fg: '#92400E', label: 'Shortlisted' },
  admitted:     { bg: '#D1FAE5', fg: '#065F46', label: 'Admitted' },
  waitlisted:   { bg: '#FEF3C7', fg: '#92400E', label: 'Waitlisted' },
  declined:     { bg: '#FFE4E6', fg: '#9F1239', label: 'Declined' },
};

/**
 * Application tracking — parent's view of every admission application
 * for their linked children. Pulls /admission-passport/applications/my/
 * which scopes to the current user. Tapping a row opens the institution
 * in the discovery view so the parent can re-read facilities and notes.
 */
export default function ApplicationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const query = useApiQuery<AdmissionApplication[]>(
    ['parent-applications'],
    () => schoolMatchApi.myApplications(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];
  const active = items.filter((a) => !['admitted', 'declined'].includes(a.status));
  const closed = items.filter((a) => ['admitted', 'declined'].includes(a.status));

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Admissions</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Applications</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Every school you've applied to and where the application is at.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : items.length === 0 ? (
        <View className="px-5">
          <EmptyState
            title="No applications yet"
            message="When your child is ready for in-person learning, you can browse schools and apply from there."
          />
          <View className="mt-4">
            <Pressable
              onPress={() => router.push('/(student)/school-match' as any)}
              accessibilityRole="button"
              accessibilityLabel="Open school match"
              className="rounded-3xl p-4 flex-row items-center"
              style={{ backgroundColor: '#FFEDD5' }}
            >
              <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
                <Ionicons name="business-outline" size={22} color="#9A3412" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-orange-900">Open School Match</Text>
                <Text className="text-xs text-orange-800 mt-0.5">
                  Browse great-fit institutions when in-person learning is on the table.
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#9A3412" />
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="px-5">
          {active.length > 0 && (
            <Section label={`Active · ${active.length}`}>
              {active.map((a) => (
                <ApplicationCard
                  key={String(a.id)}
                  a={a}
                  onPress={() => router.push(`/(student)/school-match/${a.institution}` as any)}
                />
              ))}
            </Section>
          )}
          {closed.length > 0 && (
            <Section label={`Closed · ${closed.length}`}>
              {closed.map((a) => (
                <ApplicationCard
                  key={String(a.id)}
                  a={a}
                  onPress={() => router.push(`/(student)/school-match/${a.institution}` as any)}
                />
              ))}
            </Section>
          )}
        </View>
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

const Section: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
  <View className="mb-5">
    <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">{label}</Text>
    {children}
  </View>
);

const ApplicationCard: React.FC<{ a: AdmissionApplication; onPress?: () => void }> = ({ a, onPress }) => {
  const tint = STATUS_TINT[a.status] || STATUS_TINT.submitted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open application to ${a.institution_name}`}
      className="bg-white rounded-2xl p-4 mb-3"
      style={cardShadow}
    >
      <View className="flex-row items-center">
        <View className="w-11 h-11 rounded-2xl bg-slate-100 items-center justify-center mr-3">
          <Ionicons name="business-outline" size={20} color="#0F2A45" />
        </View>
        <View className="flex-1 pr-2">
          <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">{a.institution_name}</Text>
          <Text className="text-[11px] text-slate-500 mt-0.5">
            {a.submitted_at
              ? `Sent ${new Date(a.submitted_at).toLocaleDateString()}`
              : 'Not yet submitted'}
            {a.passport_share_consent ? ' · Passport shared' : ''}
          </Text>
        </View>
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: tint.bg }}>
          <Text className="text-[10px] font-bold" style={{ color: tint.fg }}>
            {tint.label.toUpperCase()}
          </Text>
        </View>
      </View>
      {!!a.institution_note && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">School note</Text>
          <Text className="text-xs text-slate-700 leading-relaxed">{a.institution_note}</Text>
        </View>
      )}
    </Pressable>
  );
};
