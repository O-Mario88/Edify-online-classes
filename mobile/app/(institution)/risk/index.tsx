import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { institutionApi, type InstitutionHomePayload, type InstitutionHomeRiskAlert } from '@/api/institution.api';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Institution risk alerts — top 5 active alerts pulled off the home
 * aggregator. Severity drives the colour treatment so the eye triages
 * before the brain reads.
 */
export default function InstitutionRiskAlerts() {
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

  const alerts = query.data?.risk_alerts ?? [];
  const totalCount = query.data?.kpis?.risk_alerts ?? alerts.length;

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Risk alerts</Text>
        <Text style={styles.title}>Early-warning</Text>
        <Text style={styles.subtitle}>
          Falling attendance, slipping grades, classes not delivered — surfaced before they become problems.
        </Text>
      </View>

      {query.isLoading && !query.data ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : alerts.length === 0 ? (
        <EmptyState
          title="All clear"
          message={totalCount > 0
            ? `${totalCount} alerts open in the system, none in the last week.`
            : 'No risk signals are being tracked right now.'}
        />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          {alerts.map((a) => (
            <AlertRow key={a.id} alert={a} />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const SEVERITY_TINT: Record<string, { bg: string; fg: string; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap }> = {
  critical: { bg: palette.rose[50],   fg: palette.rose[800],   icon: 'alert-circle-outline' },
  warning:  { bg: palette.amber[50],  fg: palette.amber[800],  icon: 'warning-outline' },
  info:     { bg: palette.indigo[50], fg: palette.indigo[700], icon: 'information-circle-outline' },
};

const AlertRow: React.FC<{ alert: InstitutionHomeRiskAlert }> = ({ alert }) => {
  const tint = SEVERITY_TINT[alert.severity] || SEVERITY_TINT.info;
  return (
    <View style={{ backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 14, ...shadows.xs, flexDirection: 'row' }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: tint.bg, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        <Ionicons name={tint.icon} size={18} color={tint.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary, flex: 1 }}>
            {alert.subject || alert.kind}
          </Text>
          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, backgroundColor: tint.bg }}>
            <Text style={{ fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, color: tint.fg, letterSpacing: 0.5 }}>
              {alert.severity.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 }}>
          {alert.message}
        </Text>
        {alert.created_at && (
          <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 4 }}>
            {new Date(alert.created_at).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
