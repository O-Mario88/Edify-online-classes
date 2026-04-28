import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { api } from '@/api/client';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

interface InstitutionApplication {
  id: number | string;
  applicant_name: string;
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'admitted' | 'waitlisted' | 'declined' | string;
  submitted_at: string | null;
  class_level?: string;
  passport_share_consent?: boolean;
  match_score?: number | null;
}

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

const STATUS_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  submitted:   { bg: palette.indigo[50],  fg: palette.indigo[700], label: 'Submitted' },
  reviewing:   { bg: palette.amber[50],   fg: palette.amber[800],  label: 'Reviewing' },
  shortlisted: { bg: palette.amber[50],   fg: palette.amber[800],  label: 'Shortlisted' },
  admitted:    { bg: palette.emerald[50], fg: palette.emerald[800], label: 'Admitted' },
  waitlisted:  { bg: palette.amber[50],   fg: palette.amber[800],  label: 'Waitlisted' },
  declined:    { bg: palette.rose[50],    fg: palette.rose[800],   label: 'Declined' },
};

const NEXT_STATUS: Record<string, string> = {
  submitted: 'reviewing',
  reviewing: 'shortlisted',
};

/**
 * Application review inbox — formal admission applications targeted at
 * this institution. Uses /admission-passport/applications/institution-inbox/.
 * Tap an action to advance the workflow (submitted → reviewing → shortlisted),
 * with admit / decline as terminal moves.
 */
export default function InstitutionApplicationReview() {
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  const query = useApiQuery<InstitutionApplication[]>(
    ['institution-application-inbox'],
    async () => {
      const r = await api.get<any>('/admission-passport/applications/institution-inbox/');
      return r.error ? { data: null, error: r.error } : { data: arr<InstitutionApplication>(r.data), error: null };
    },
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const onChangeStatus = async (app: InstitutionApplication, status: string) => {
    setUpdatingId(app.id);
    const { error } = await api.post<any>(`/admission-passport/applications/${app.id}/change-status/`, {
      status,
    });
    setUpdatingId(null);
    if (error) {
      Alert.alert('Could not update', error.message || 'Try again in a moment.');
      return;
    }
    await query.refetch();
  };

  const items = query.data ?? [];
  const counts = {
    open: items.filter((a) => !['admitted', 'declined'].includes(a.status)).length,
    decided: items.filter((a) => ['admitted', 'declined'].includes(a.status)).length,
  };

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Application review</Text>
        <Text style={styles.title}>Admissions inbox</Text>
        <Text style={styles.subtitle}>
          {counts.open} open · {counts.decided} decided. Tap any row to advance, admit, or decline.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title="Inbox is empty" message="Submitted applications will appear here once parents send them." />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          {items.map((app) => (
            <ApplicationRow
              key={String(app.id)}
              application={app}
              onAdvance={(next) => onChangeStatus(app, next)}
              busy={updatingId === app.id}
            />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const ApplicationRow: React.FC<{
  application: InstitutionApplication;
  onAdvance: (status: string) => void;
  busy: boolean;
}> = ({ application, onAdvance, busy }) => {
  const tint = STATUS_TINT[application.status] || STATUS_TINT.submitted;
  const next = NEXT_STATUS[application.status];
  const terminal = ['admitted', 'declined'].includes(application.status);
  return (
    <View style={{ backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 14, ...shadows.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
            {application.applicant_name}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }} numberOfLines={1}>
            {application.class_level || '—'}
            {application.match_score ? ` · match ${application.match_score}` : ''}
            {application.passport_share_consent ? ' · Passport shared' : ''}
            {application.submitted_at ? ` · ${new Date(application.submitted_at).toLocaleDateString()}` : ''}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: tint.bg }}>
          <Text style={{ fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, color: tint.fg, letterSpacing: 0.5 }}>
            {tint.label.toUpperCase()}
          </Text>
        </View>
      </View>
      {!terminal && (
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
          {next && (
            <ActionButton
              label={next === 'reviewing' ? 'Open for review' : 'Shortlist'}
              tone="navy"
              busy={busy}
              onPress={() => onAdvance(next)}
            />
          )}
          <ActionButton
            label="Admit"
            tone="emerald"
            busy={busy}
            onPress={() => onAdvance('admitted')}
          />
          <ActionButton
            label="Decline"
            tone="rose"
            busy={busy}
            onPress={() => onAdvance('declined')}
          />
        </View>
      )}
    </View>
  );
};

const ActionButton: React.FC<{ label: string; tone: 'navy' | 'emerald' | 'rose'; busy: boolean; onPress: () => void }> = ({ label, tone, busy, onPress }) => {
  const bg = tone === 'navy' ? colors.brand.primary : tone === 'emerald' ? palette.emerald[700] : palette.rose[700];
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        { flex: 1, paddingVertical: 9, borderRadius: 9999, backgroundColor: bg, alignItems: 'center', opacity: busy || pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={{ color: colors.text.onBrand, fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 0.4 }}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
