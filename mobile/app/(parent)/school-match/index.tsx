import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { schoolMatchApi, type InstitutionCard } from '@/api/schoolMatch.api';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Parent-facing School Match listing. Mirrors the student screen but
 * with parent framing — "schools that fit your child" rather than
 * "where you might go". Tapping a card opens the parent-side detail
 * (still on the student detail route since the institution data is
 * the same; deep-link to apply).
 *
 * Route: /(parent)/school-match
 */
export default function ParentSchoolMatchScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const recommendationsQuery = useApiQuery<InstitutionCard[]>(
    ['parent-school-match-recommendations'],
    () => schoolMatchApi.recommendations(),
    { staleTime: 60_000 },
  );
  const directoryQuery = useApiQuery<InstitutionCard[]>(
    ['parent-school-match-directory'],
    () => schoolMatchApi.list(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([recommendationsQuery.refetch(), directoryQuery.refetch()]);
    setRefreshing(false);
  };

  const recommendations = recommendationsQuery.data ?? [];
  const directory = directoryQuery.data ?? [];

  const filteredDirectory = useMemo(() => {
    if (!search.trim()) return directory;
    const q = search.toLowerCase();
    return directory.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      (s.location || '').toLowerCase().includes(q),
    );
  }, [directory, search]);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>School match</Text>
        <Text style={styles.title}>Schools that fit your child</Text>
        <Text style={styles.subtitle}>
          Recommendations are calibrated against your child's Learning Passport. Tap any school to apply.
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface.raised, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 10, ...shadows.xs }}>
          <Ionicons name="search-outline" size={18} color={colors.text.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or town"
            placeholderTextColor={colors.text.soft}
            style={{ flex: 1, marginLeft: 10, fontSize: fontSize.sm, color: colors.text.primary }}
          />
        </View>
      </View>

      {/* Recommendations */}
      {recommendationsQuery.isLoading && recommendations.length === 0 ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <LoadingSkeleton height={120} lines={2} />
        </View>
      ) : recommendationsQuery.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => recommendationsQuery.refetch()} />
        </View>
      ) : recommendations.length > 0 ? (
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <Text style={styles.sectionEyebrow}>RECOMMENDED FOR YOUR CHILD</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            {recommendations.slice(0, 4).map((s) => (
              <SchoolRow
                key={String(s.id)}
                school={s}
                onPress={() => router.push(`/(parent)/apply?institution=${s.id}` as any)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* Directory */}
      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <Text style={styles.sectionEyebrow}>BROWSE ALL SCHOOLS</Text>
        {directoryQuery.isLoading && directory.length === 0 ? (
          <View style={{ marginTop: 12 }}><LoadingSkeleton height={80} lines={3} /></View>
        ) : filteredDirectory.length === 0 ? (
          <EmptyState
            title="No matches"
            message={search ? 'Try a different name or town.' : 'No partner schools yet — check back soon.'}
          />
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {filteredDirectory.map((s) => (
              <SchoolRow
                key={String(s.id)}
                school={s}
                onPress={() => router.push(`/(parent)/apply?institution=${s.id}` as any)}
              />
            ))}
          </View>
        )}
      </View>
    </AppScreen>
  );
}

const SchoolRow: React.FC<{ school: InstitutionCard; onPress: () => void }> = ({ school, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Apply to ${school.name}`}
    style={({ pressed }) => [
      {
        backgroundColor: colors.surface.raised,
        borderRadius: radius.card,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: pressed ? 0.92 : 1,
        ...shadows.xs,
      },
    ]}
  >
    <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: palette.indigo[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
      <Ionicons name="business-outline" size={20} color={palette.indigo[700]} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }} numberOfLines={1}>
        {school.name}
      </Text>
      <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }} numberOfLines={1}>
        {[school.location, school.stage, school.fees_band].filter(Boolean).join(' · ') || 'Maple partner school'}
      </Text>
      {typeof school.match_score === 'number' && school.match_score > 0 && (
        <Text style={{ fontSize: fontSize.xs - 1, color: palette.emerald[700], marginTop: 4, fontWeight: fontWeight.semibold as any }}>
          {school.match_score}% match
        </Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.text.soft} />
  </Pressable>
);

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
  sectionEyebrow: { fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, letterSpacing: 1.2, color: colors.text.muted },
} as const;
