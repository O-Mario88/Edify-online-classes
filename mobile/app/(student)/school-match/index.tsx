import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import {
  schoolMatchApi,
  type AdmissionApplication,
  type InstitutionCard,
} from '@/api/schoolMatch.api';

/**
 * School Match — secondary, optional surface for learners ready to
 * explore in-person education. Three sections:
 *
 *   1. Soft positioning header — frames this as "when you're ready".
 *   2. Recommended for you carousel-card row (if backend supplies any).
 *   3. Browse list with name search.
 *
 * Backend wires through institution_discovery + admission_passport.
 */
export default function SchoolMatchScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const recommendationsQuery = useApiQuery<InstitutionCard[]>(
    ['school-match-recommendations'],
    () => schoolMatchApi.recommendations(),
    { staleTime: 60_000 },
  );
  const directoryQuery = useApiQuery<InstitutionCard[]>(
    ['school-match-directory'],
    () => schoolMatchApi.list(),
    { staleTime: 60_000 },
  );
  const applicationsQuery = useApiQuery<AdmissionApplication[]>(
    ['school-match-applications'],
    () => schoolMatchApi.myApplications(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      recommendationsQuery.refetch(),
      directoryQuery.refetch(),
      applicationsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const recommendations = recommendationsQuery.data ?? [];
  const directory = directoryQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return directory;
    return directory.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.location || '').toLowerCase().includes(q),
    );
  }, [directory, search]);

  const isLoading = (recommendationsQuery.isLoading && recommendations.length === 0)
    && (directoryQuery.isLoading && directory.length === 0);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Optional</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Find a great-fit school</Text>
        <Text className="text-sm text-slate-600 mt-1 leading-relaxed">
          When you're ready for in-person learning, Maple can help you discover institutions that match
          your progress, goals, and learning needs.
        </Text>
      </View>

      {/* My applications — only when there are any */}
      {applications.length > 0 && (
        <View className="px-5 mb-5">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            My applications
          </Text>
          {applications.slice(0, 3).map((a) => <ApplicationStrip key={String(a.id)} a={a} />)}
        </View>
      )}

      {/* Search */}
      <View className="px-5 mb-3">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2" style={cardShadow}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search schools, town, or district"
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-2 text-sm text-slate-900"
          />
        </View>
      </View>

      {isLoading ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : directoryQuery.isError ? (
        <View className="px-5"><ErrorState onRetry={() => directoryQuery.refetch()} /></View>
      ) : (
        <>
          {recommendations.length > 0 && search.trim() === '' && (
            <View className="px-5 mb-5">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Recommended for you
              </Text>
              {recommendations.slice(0, 5).map((i) => (
                <InstitutionCardRow
                  key={`rec-${i.id}`}
                  institution={i}
                  highlighted
                  onPress={() => router.push(`/(student)/school-match/${i.id}` as any)}
                />
              ))}
              <Text className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Recommendations are based on your Passport, recent results, and stage.
              </Text>
            </View>
          )}

          <View className="px-5">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Browse
            </Text>
            {filtered.length === 0 ? (
              <EmptyState
                title={search ? 'No schools match' : 'No schools listed yet'}
                message={
                  search
                    ? 'Try a different name or district.'
                    : 'Schools that opt into discovery appear here once their profile is published.'
                }
              />
            ) : (
              filtered.map((i) => (
                <InstitutionCardRow
                  key={String(i.id)}
                  institution={i}
                  onPress={() => router.push(`/(student)/school-match/${i.id}` as any)}
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

const STATUS_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  draft:        { bg: '#FEF3C7', fg: '#92400E', label: 'Draft' },
  submitted:    { bg: '#E0E7FF', fg: '#3730A3', label: 'Submitted' },
  reviewing:    { bg: '#E0E7FF', fg: '#3730A3', label: 'Reviewing' },
  shortlisted:  { bg: '#FEF3C7', fg: '#92400E', label: 'Shortlisted' },
  admitted:     { bg: '#D1FAE5', fg: '#065F46', label: 'Admitted' },
  waitlisted:   { bg: '#FEF3C7', fg: '#92400E', label: 'Waitlisted' },
  declined:     { bg: '#FFE4E6', fg: '#9F1239', label: 'Declined' },
};

const ApplicationStrip: React.FC<{ a: AdmissionApplication }> = ({ a }) => {
  const tint = STATUS_TINT[a.status] || STATUS_TINT.submitted;
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center" style={cardShadow}>
      <View className="w-10 h-10 rounded-2xl bg-slate-100 items-center justify-center mr-3">
        <Ionicons name="business-outline" size={18} color="#334155" />
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">{a.institution_name}</Text>
        <Text className="text-[11px] text-slate-500 mt-0.5">
          Last updated {new Date(a.updated_at).toLocaleDateString()}
        </Text>
      </View>
      <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: tint.bg }}>
        <Text className="text-[10px] font-bold" style={{ color: tint.fg }}>
          {tint.label.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const InstitutionCardRow: React.FC<{
  institution: InstitutionCard;
  highlighted?: boolean;
  onPress?: () => void;
}> = ({ institution, highlighted, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Open ${institution.name}`}
    className="bg-white rounded-2xl p-4 mb-3"
    style={[
      cardShadow,
      highlighted ? { borderWidth: 1, borderColor: '#E8C9A4' } : undefined,
    ]}
  >
    <View className="flex-row items-center mb-1.5">
      <View className="w-11 h-11 rounded-2xl bg-slate-100 items-center justify-center mr-3">
        <Ionicons name="school-outline" size={20} color="#0F2A45" />
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">{institution.name}</Text>
        <Text numberOfLines={1} className="text-[11px] text-slate-500 mt-0.5">
          {institution.location || 'Location pending'}
          {institution.stage ? ` · ${institution.stage}` : ''}
          {institution.fees_band ? ` · ${institution.fees_band}` : ''}
        </Text>
      </View>
      {typeof institution.match_score === 'number' && (
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7' }}>
          <Text className="text-[10px] font-bold text-amber-800">{institution.match_score}% MATCH</Text>
        </View>
      )}
    </View>
    {!!institution.tagline && (
      <Text numberOfLines={2} className="text-xs text-slate-600 leading-relaxed">{institution.tagline}</Text>
    )}
    {institution.match_reasons && institution.match_reasons.length > 0 && (
      <View className="mt-2 flex-row flex-wrap" style={{ gap: 6 }}>
        {institution.match_reasons.slice(0, 3).map((r, i) => (
          <View key={i} className="px-2 py-0.5 rounded-full bg-emerald-50">
            <Text className="text-[10px] font-semibold text-emerald-800">{r}</Text>
          </View>
        ))}
      </View>
    )}
  </Pressable>
);
