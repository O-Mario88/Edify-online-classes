import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { schoolMatchApi, type InstitutionCard } from '@/api/schoolMatch.api';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Apply to a school — pick from recommended institutions, tap to start
 * a draft application. The full application form lives on the web
 * admin; mobile creates the draft and routes to the application
 * tracker once submitted. The same packet works for multiple schools.
 */
export default function ParentApply() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState<string | number | null>(null);

  const query = useApiQuery<InstitutionCard[]>(
    ['parent-recommendations'],
    () => schoolMatchApi.recommendations(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const onApply = async (inst: InstitutionCard) => {
    setSubmitting(inst.id);
    const { error } = await schoolMatchApi.startApplication(inst.id);
    setSubmitting(null);
    if (error) {
      Alert.alert('Could not start application', error.message || 'Try again in a moment.');
      return;
    }
    Alert.alert(
      'Application drafted',
      `A draft application to ${inst.name} is in your applications list. Open it to attach the Passport packet and submit.`,
      [{ text: 'See applications', onPress: () => router.push('/(parent)/applications' as any) }],
    );
  };

  const items = query.data ?? [];

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>School applications</Text>
        <Text style={styles.title}>Apply to a school</Text>
        <Text style={styles.subtitle}>
          Build one packet from your child's Learning Passport, then send it to as many schools as you like.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
          message="Confirm your child's region and grade in school-match preferences and we'll surface schools that fit."
        />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          {items.map((inst) => (
            <SchoolRow
              key={String(inst.id)}
              institution={inst}
              onApply={() => onApply(inst)}
              busy={submitting === inst.id}
            />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const SchoolRow: React.FC<{ institution: InstitutionCard; onApply: () => void; busy: boolean }> = ({ institution, onApply, busy }) => (
  <View style={{ backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 14, ...shadows.xs }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: palette.indigo[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Ionicons name="business-outline" size={20} color={palette.indigo[700]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
          {institution.name}
        </Text>
        <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }} numberOfLines={1}>
          {[institution.location, institution.stage, institution.fees_band]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        {!!institution.tagline && (
          <Text style={{ fontSize: fontSize.xs, color: colors.text.body, marginTop: 6, lineHeight: fontSize.xs * 1.55 }} numberOfLines={2}>
            {institution.tagline}
          </Text>
        )}
      </View>
    </View>
    <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
      <Pressable
        onPress={onApply}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={`Start application to ${institution.name}`}
        style={({ pressed }) => [
          {
            flex: 1,
            paddingVertical: 10,
            borderRadius: radius.cardLg,
            backgroundColor: colors.brand.primary,
            alignItems: 'center',
            opacity: busy || pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={{ color: colors.text.onBrand, fontSize: fontSize.sm, fontWeight: fontWeight.bold as any }}>
          {busy ? 'Drafting…' : 'Start application'}
        </Text>
      </Pressable>
    </View>
  </View>
);

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
