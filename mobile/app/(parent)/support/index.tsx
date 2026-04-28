import React, { useState } from 'react';
import { View, Text, Pressable, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { api } from '@/api/client';
import { useParentStore } from '@/auth/parentStore';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

interface AvailableSlot {
  id: number | string;
  teacher_name: string;
  subjects?: string[];
  starts_at: string | null;
  ends_at: string | null;
  bio?: string;
  rating?: number;
}

interface MySupportRequest {
  id: number | string;
  status: 'open' | 'claimed' | 'resolved' | 'cancelled' | string;
  question: string;
  subject?: string;
  assigned_teacher_name?: string;
  created_at: string;
}

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Parent support — browse on-call standby teachers and submit a
 * support request scoped to the selected child. Existing requests
 * (and their assigned teacher / status) appear at the top so the
 * parent can see what's pending without re-asking.
 */
export default function ParentSupport() {
  const selectedChildId = useParentStore((s) => s.selectedChildId);
  const [refreshing, setRefreshing] = useState(false);
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableQuery = useApiQuery<AvailableSlot[]>(
    ['standby-available'],
    async () => {
      const r = await api.get<any>('/standby-teachers/availability/available/');
      return r.error ? { data: null, error: r.error } : { data: arr<AvailableSlot>(r.data), error: null };
    },
    { staleTime: 60_000 },
  );

  const myRequestsQuery = useApiQuery<MySupportRequest[]>(
    ['standby-my-requests'],
    async () => {
      const r = await api.get<any>('/standby-teachers/support-requests/my/');
      return r.error ? { data: null, error: r.error } : { data: arr<MySupportRequest>(r.data), error: null };
    },
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([availableQuery.refetch(), myRequestsQuery.refetch()]);
    setRefreshing(false);
  };

  const onSubmit = async () => {
    if (!question.trim()) {
      Alert.alert('Add a question', 'Tell the teacher what you need help with.');
      return;
    }
    setSubmitting(true);
    const { error } = await api.post<any>('/standby-teachers/support-requests/', {
      question: question.trim(),
      subject: subject.trim() || undefined,
      learner_id: selectedChildId,
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Could not send', error.message || 'Try again in a moment.');
      return;
    }
    setQuestion('');
    setSubject('');
    await myRequestsQuery.refetch();
    Alert.alert('Request sent', 'A standby teacher will pick this up shortly.');
  };

  const slots = availableQuery.data ?? [];
  const requests = myRequestsQuery.data ?? [];

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Support sessions</Text>
        <Text style={styles.title}>Get help</Text>
        <Text style={styles.subtitle}>
          Send a question to a standby teacher. They reply via the in-app messages thread.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 12 }}>
        <View style={{ backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 14, ...shadows.xs, gap: 10 }}>
          <Text style={styles.cardEyebrow}>NEW REQUEST</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject (optional)"
            placeholderTextColor={colors.text.soft}
            style={inputStyle}
          />
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="What do you need help with?"
            placeholderTextColor={colors.text.soft}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={[inputStyle, { minHeight: 80 }]}
          />
          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Submit support request"
            style={({ pressed }) => [
              {
                paddingVertical: 11,
                borderRadius: radius.cardLg,
                backgroundColor: colors.brand.primary,
                alignItems: 'center',
                opacity: submitting || pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={{ color: colors.text.onBrand, fontSize: fontSize.sm, fontWeight: fontWeight.bold as any }}>
              {submitting ? 'Sending…' : 'Send to standby team'}
            </Text>
          </Pressable>
        </View>

        {myRequestsQuery.isLoading && requests.length === 0 ? (
          <LoadingSkeleton height={80} lines={2} />
        ) : myRequestsQuery.isError ? (
          <ErrorState onRetry={() => myRequestsQuery.refetch()} />
        ) : requests.length > 0 ? (
          <View style={{ gap: 10 }}>
            <Text style={styles.sectionLabel}>YOUR REQUESTS</Text>
            {requests.map((r) => <RequestRow key={String(r.id)} req={r} />)}
          </View>
        ) : null}

        {availableQuery.isLoading && slots.length === 0 ? null : availableQuery.isError ? null : slots.length > 0 ? (
          <View style={{ gap: 10 }}>
            <Text style={styles.sectionLabel}>ON CALL NOW</Text>
            {slots.map((s) => <SlotRow key={String(s.id)} slot={s} />)}
          </View>
        ) : (
          <EmptyState title="No standby teachers right now" message="Send a request anyway — it'll be picked up when one comes online." />
        )}
      </View>
    </AppScreen>
  );
}

const STATUS_TINT: Record<string, { bg: string; fg: string }> = {
  open:      { bg: palette.amber[50],   fg: palette.amber[800]   },
  claimed:   { bg: palette.indigo[50],  fg: palette.indigo[700]  },
  resolved:  { bg: palette.emerald[50], fg: palette.emerald[800] },
  cancelled: { bg: palette.slate[200],  fg: palette.slate[700]   },
};

const RequestRow: React.FC<{ req: MySupportRequest }> = ({ req }) => {
  const tint = STATUS_TINT[req.status] || STATUS_TINT.open;
  return (
    <View style={{ backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 12, ...shadows.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: tint.bg, marginRight: 8 }}>
          <Text style={{ fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, color: tint.fg, letterSpacing: 0.5 }}>
            {req.status.toUpperCase()}
          </Text>
        </View>
        {!!req.subject && (
          <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold as any, color: colors.text.body }}>
            {req.subject}
          </Text>
        )}
      </View>
      <Text style={{ fontSize: fontSize.sm, color: colors.text.primary, marginTop: 6, lineHeight: fontSize.sm * 1.5 }} numberOfLines={2}>
        {req.question}
      </Text>
      <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 4 }}>
        {req.assigned_teacher_name ? `with ${req.assigned_teacher_name}` : 'unassigned'}
        {' · '}
        {new Date(req.created_at).toLocaleDateString()}
      </Text>
    </View>
  );
};

const SlotRow: React.FC<{ slot: AvailableSlot }> = ({ slot }) => (
  <View style={{ backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 12, flexDirection: 'row', alignItems: 'center', ...shadows.xs }}>
    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: palette.teal[50], alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
      <Ionicons name="person-circle-outline" size={20} color={palette.teal[800]} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
        {slot.teacher_name}
      </Text>
      <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }} numberOfLines={1}>
        {(slot.subjects || []).join(', ') || 'General'}
        {typeof slot.rating === 'number' && slot.rating > 0 ? ` · ★ ${slot.rating.toFixed(1)}` : ''}
      </Text>
    </View>
  </View>
);

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.border.default,
  borderRadius: radius.md,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: fontSize.sm,
  color: colors.text.primary,
} as const;

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
  cardEyebrow: { fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, letterSpacing: 1.2, color: colors.text.muted },
  sectionLabel: { fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, letterSpacing: 1.2, color: colors.text.muted, paddingHorizontal: 6 },
} as const;
