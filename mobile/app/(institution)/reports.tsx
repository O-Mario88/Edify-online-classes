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
 * Headline reports surface for the head-teacher / DOS. Reads off the
 * institution-home aggregator's KPI strip and renders the four
 * dimensions as separate score cards. Branded PDF export lives on the
 * web admin until the mobile renderer ships — that's flagged below.
 */
export default function InstitutionReports() {
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

  const inst = query.data?.institution;
  const kpis = query.data?.kpis;

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Reports</Text>
        <Text style={styles.title}>{inst?.name || 'School snapshot'}</Text>
        <Text style={styles.subtitle}>
          Term-level health across the four pillars. Tap any card to see the underlying drill-down on the web admin.
        </Text>
      </View>

      {query.isLoading && !query.data ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={4} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : !kpis ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.text.muted }}>No data yet.</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 12 }}>
          <HealthHero score={kpis.health_score} />
          <ScoreCard label="Attendance"         pct={kpis.attendance}        icon="calendar-outline" tone="emerald" />
          <ScoreCard label="Teacher delivery"   pct={kpis.teacher_delivery}  icon="speedometer-outline" tone="indigo" />
          <ScoreCard label="Parent engagement"  pct={kpis.parent_engagement} icon="chatbubbles-outline" tone="amber" />
          <FootnoteCard count={kpis.risk_alerts} />
        </View>
      )}
    </AppScreen>
  );
}

const HealthHero: React.FC<{ score: number }> = ({ score }) => {
  const tone = score >= 75 ? 'emerald' : score >= 50 ? 'amber' : 'rose';
  const fg = tone === 'emerald' ? palette.emerald[700] : tone === 'amber' ? palette.amber[800] : palette.rose[700];
  const bg = tone === 'emerald' ? palette.emerald[50] : tone === 'amber' ? palette.amber[50] : palette.rose[50];
  return (
    <View style={{ backgroundColor: colors.brand.primary, borderRadius: radius.cardLg, padding: 18, ...shadows.deep }}>
      <Text style={{ fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, letterSpacing: 1.2, color: colors.brand.accent }}>
        SCHOOL HEALTH SCORE
      </Text>
      <Text style={{ fontSize: 48, fontWeight: fontWeight.extrabold as any, color: colors.text.onBrand, marginTop: 4 }}>
        {score}
      </Text>
      <Text style={{ fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)' }}>
        {score >= 75 ? 'Strong term — keep the rhythm.' : score >= 50 ? 'Healthy with attention areas.' : 'Needs urgent intervention.'}
      </Text>
      <View style={{ marginTop: 12, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
        <View style={{ width: `${Math.max(0, Math.min(100, score))}%`, height: '100%', backgroundColor: fg, borderRadius: 3 }} />
      </View>
    </View>
  );
};

const ScoreCard: React.FC<{ label: string; pct: number; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; tone: 'emerald' | 'amber' | 'indigo' | 'rose' }> = ({ label, pct, icon, tone }) => {
  const bg = tone === 'emerald' ? palette.emerald[50] : tone === 'amber' ? palette.amber[50] : tone === 'rose' ? palette.rose[50] : palette.indigo[50];
  const fg = tone === 'emerald' ? palette.emerald[700] : tone === 'amber' ? palette.amber[800] : tone === 'rose' ? palette.rose[700] : palette.indigo[700];
  return (
    <AppCard>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Ionicons name={icon} size={18} color={fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
            {label}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }}>
            Latest term snapshot
          </Text>
        </View>
        <Text style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: fg }}>
          {pct}%
        </Text>
      </View>
    </AppCard>
  );
};

const FootnoteCard: React.FC<{ count: number }> = ({ count }) => (
  <AppCard>
    <Text style={{ fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, letterSpacing: 1.2, color: colors.text.muted }}>
      RISK ALERTS
    </Text>
    <Text style={{ fontSize: fontSize.sm, color: colors.text.body, marginTop: 6, lineHeight: fontSize.sm * 1.5 }}>
      {count > 0
        ? `${count} active alert${count === 1 ? '' : 's'} need attention. Open the Risk Alerts tab to triage.`
        : 'No active alerts. The system will surface them here as soon as a metric trips.'}
    </Text>
  </AppCard>
);

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
