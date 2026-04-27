import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { institutionApi, type InstitutionHomePayload } from '@/api/institution.api';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Teacher delivery — single hero KPI from the institution home
 * aggregator. Per-teacher breakdown lives on the web admin until a
 * mobile per-teacher feed lands.
 */
export default function InstitutionTeacherDelivery() {
  const [refreshing, setRefreshing] = useState(false);
  const query = useApiQuery<InstitutionHomePayload>(
    ['institution-home'],
    () => institutionApi.home(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const pct = query.data?.kpis?.teacher_delivery ?? null;
  const tone = pct == null ? 'amber' : pct >= 85 ? 'emerald' : pct >= 70 ? 'amber' : 'rose';

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Teacher delivery</Text>
        <Text style={styles.title}>How class is going</Text>
        <Text style={styles.subtitle}>
          Punctuality, lesson notes published, feedback turnaround, parent ratings.
        </Text>
      </View>

      {query.isLoading && !query.data ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 12 }}>
          <HeroPct pct={pct} tone={tone} />
          <SignalCard
            icon="time-outline"
            label="Punctuality"
            body="Average start time relative to the scheduled slot, rolled up across your teaching staff."
          />
          <SignalCard
            icon="document-text-outline"
            label="Notes shipped"
            body="Share of lessons with published notes within 48 hours of the live session."
          />
          <SignalCard
            icon="star-outline"
            label="Parent ratings"
            body="Rolling 30-day average rating from parent feedback after live classes."
          />
        </View>
      )}
    </AppScreen>
  );
}

const HeroPct: React.FC<{ pct: number | null; tone: 'emerald' | 'amber' | 'rose' }> = ({ pct, tone }) => {
  const fg = tone === 'emerald' ? palette.emerald[700] : tone === 'amber' ? palette.amber[800] : palette.rose[700];
  const bg = tone === 'emerald' ? palette.emerald[50] : tone === 'amber' ? palette.amber[50] : palette.rose[50];
  return (
    <View style={{ backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 18, ...shadows.xs }}>
      <Text style={{ fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, letterSpacing: 1.2, color: colors.text.muted }}>
        DELIVERY SCORE
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
        <Text style={{ fontSize: 42, fontWeight: fontWeight.extrabold as any, color: fg }}>
          {pct == null ? '—' : `${pct}%`}
        </Text>
        <Text style={{ marginLeft: 10, fontSize: fontSize.sm, color: colors.text.muted }}>
          of classes delivered to spec
        </Text>
      </View>
      <View style={{ marginTop: 12, height: 6, borderRadius: 3, backgroundColor: bg, overflow: 'hidden' }}>
        <View style={{ width: `${pct ?? 0}%`, height: '100%', backgroundColor: fg }} />
      </View>
    </View>
  );
};

const SignalCard: React.FC<{ icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; label: string; body: string }> = ({ icon, label, body }) => (
  <AppCard>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: palette.indigo[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Ionicons name={icon} size={18} color={palette.indigo[700]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
          {label}
        </Text>
        <Text style={{ fontSize: fontSize.xs, color: colors.text.body, marginTop: 4, lineHeight: fontSize.xs * 1.55 }}>
          {body}
        </Text>
      </View>
    </View>
  </AppCard>
);

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
