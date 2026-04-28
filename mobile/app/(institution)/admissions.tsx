import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { institutionApi, type AdmissionInboxItem } from '@/api/institution.api';

const STATUS_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  ping:       { bg: '#FEF3C7', fg: '#92400E', label: 'Ping' },
  submitted:  { bg: '#E0E7FF', fg: '#3730A3', label: 'Submitted' },
  reviewing:  { bg: '#E0E7FF', fg: '#3730A3', label: 'Reviewing' },
  responded:  { bg: '#D1FAE5', fg: '#065F46', label: 'Responded' },
};

/**
 * Admission Interest Inbox — applicants who have pinged or applied
 * to the institution. Pulls /admission-passport/applications/
 * institution-inbox/ which scopes to the admin's school.
 */
export default function InstitutionAdmissionsTab() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const query = useApiQuery<AdmissionInboxItem[]>(
    ['institution-admissions'],
    () => institutionApi.admissionInbox(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];
  const open = items.filter((i) => i.status !== 'responded');
  const done = items.filter((i) => i.status === 'responded');

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Admissions</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Admission Interest Inbox</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Families enquiring about a place — ranked by fit and waiting for your response.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : items.length === 0 ? (
        <View className="px-5">
          <EmptyState
            title="No enquiries yet"
            message="Pings and applications appear here as families discover your school on Maple."
          />
        </View>
      ) : (
        <View className="px-5">
          {open.length > 0 && (
            <Section label={`Awaiting reply · ${open.length}`}>
              {open.map((a) => (
                <ApplicantCard
                  key={String(a.id)}
                  a={a}
                  onPress={() => router.push(`/(institution)/application-review?id=${a.id}` as any)}
                />
              ))}
            </Section>
          )}
          {done.length > 0 && (
            <Section label={`Responded · ${done.length}`}>
              {done.map((a) => (
                <ApplicantCard
                  key={String(a.id)}
                  a={a}
                  onPress={() => router.push(`/(institution)/application-review?id=${a.id}` as any)}
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

const ApplicantCard: React.FC<{ a: AdmissionInboxItem; onPress?: () => void }> = ({ a, onPress }) => {
  const tint = STATUS_TINT[a.status] || STATUS_TINT.submitted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open application from ${a.applicant_name}`}
      className="bg-white rounded-2xl p-4 mb-3"
      style={cardShadow}
    >
      <View className="flex-row items-center mb-1.5">
        <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
          <Text className="text-xs font-extrabold text-orange-800">
            {a.applicant_name.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase() || '?'}
          </Text>
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">{a.applicant_name}</Text>
          <Text className="text-[11px] text-slate-500 mt-0.5">
            {new Date(a.submitted_at).toLocaleDateString()}
            {a.passport_share_consent ? ' · Passport shared' : ''}
          </Text>
        </View>
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: tint.bg }}>
          <Text className="text-[10px] font-bold" style={{ color: tint.fg }}>{tint.label.toUpperCase()}</Text>
        </View>
      </View>
      {typeof a.match_score === 'number' && (
        <View className="flex-row items-center mt-1">
          <Ionicons name="star-outline" size={12} color="#92400E" />
          <Text className="text-[11px] font-bold text-amber-800 ml-1">{a.match_score}% fit</Text>
        </View>
      )}
    </Pressable>
  );
};
