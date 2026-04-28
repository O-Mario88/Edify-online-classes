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
 * Parent engagement summary — the headline % from the institution home
 * aggregator's KPIs, rendered as a single hero number with context. The
 * deeper drill-down lives on the web admin until a per-parent feed
 * lands on mobile.
 */
export default function InstitutionParentEngagement() {
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

  const kpis = query.data?.kpis;
  const pct = kpis?.parent_engagement ?? null;
  const tone = pct == null ? 'amber' : pct >= 70 ? 'emerald' : pct >= 40 ? 'amber' : 'rose';

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Parent engagement</Text>
        <Text style={styles.title}>Active families</Text>
        <Text style={styles.subtitle}>
          Families with at least one Maple session in the last seven days.
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
            icon="eye-outline"
            label="Briefs read this week"
            body="Share of weekly progress briefs opened by a parent within seven days of being sent."
          />
          <SignalCard
            icon="mail-unread-outline"
            label="Messages answered"
            body="Median time from a teacher message to a parent reply. Tracked per teacher in the web admin."
          />
          <SignalCard
            icon="ribbon-outline"
            label="Passport shares"
            body="Parents who have shared their child's Learning Passport with at least one institution."
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
        WEEKLY ACTIVE
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
        <Text style={{ fontSize: 42, fontWeight: fontWeight.extrabold as any, color: fg }}>
          {pct == null ? '—' : `${pct}%`}
        </Text>
        <Text style={{ marginLeft: 10, fontSize: fontSize.sm, color: colors.text.muted }}>
          of registered parents
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
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: palette.amber[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Ionicons name={icon} size={18} color={palette.amber[800]} />
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
