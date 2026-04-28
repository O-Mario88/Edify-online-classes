import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { api } from '@/api/client';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

interface TeacherNote {
  id: number;
  teacher: number;
  teacher_name: string;
  class_scope: number | null;
  title: string;
  body: string;
  photo_url: string;
  created_at: string;
}

interface SupportRequestRow {
  id: number | string;
  status: 'open' | 'claimed' | 'resolved' | 'cancelled' | string;
  question: string;
  subject?: string;
  assigned_teacher_name?: string;
  created_at: string;
}

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

/**
 * Parent inbox. Three sources combined:
 *   1. TeacherNote feed — broadcasts from the child's teachers
 *      (POST /lessons/teacher-notes/ on the teacher side)
 *   2. Support request thread — questions the parent has submitted
 *      via the parent support flow, plus their resolution status
 *   3. CTA to send a new question — routes to /(parent)/support
 *
 * Two-way 1:1 messaging will land when the discussions/threads
 * surface ships; until then this is the parent's read-only view of
 * teacher communications + outbound support requests.
 */
export default function ParentMessages() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const notesQuery = useApiQuery<TeacherNote[]>(
    ['parent-teacher-notes'],
    async () => {
      const r = await api.get<any>('/lessons/teacher-notes/');
      return r.error ? { data: null, error: r.error } : { data: arr<TeacherNote>(r.data), error: null };
    },
    { staleTime: 60_000 },
  );

  const supportQuery = useApiQuery<SupportRequestRow[]>(
    ['parent-support-requests'],
    async () => {
      const r = await api.get<any>('/standby-teachers/support-requests/my/');
      return r.error ? { data: null, error: r.error } : { data: arr<SupportRequestRow>(r.data), error: null };
    },
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([notesQuery.refetch(), supportQuery.refetch()]);
    setRefreshing(false);
  };

  const notes = notesQuery.data ?? [];
  const support = supportQuery.data ?? [];

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Inbox</Text>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Teacher updates and the support questions you've sent.</Text>
      </View>

      {/* Send a question CTA */}
      <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
        <Pressable
          onPress={() => router.push('/(parent)/support' as any)}
          accessibilityRole="button"
          accessibilityLabel="Ask a teacher"
          style={({ pressed }) => [
            {
              backgroundColor: colors.brand.primary,
              borderRadius: radius.cardLg,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: pressed ? 0.92 : 1,
              ...shadows.md,
            },
          ]}
        >
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.text.onBrand} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.onBrand }}>
              Ask a teacher
            </Text>
            <Text style={{ fontSize: fontSize.xs, color: 'rgba(255,255,255,0.78)', marginTop: 2 }}>
              Standby teachers usually respond within an hour.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.text.onBrand} />
        </Pressable>
      </View>

      {/* Teacher notes feed */}
      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <Text style={styles.sectionEyebrow}>FROM YOUR CHILD'S TEACHERS</Text>
        {notesQuery.isLoading && notes.length === 0 ? (
          <View style={{ marginTop: 12 }}><LoadingSkeleton height={80} lines={2} /></View>
        ) : notesQuery.isError ? (
          <View style={{ marginTop: 12 }}><ErrorState onRetry={() => notesQuery.refetch()} /></View>
        ) : notes.length === 0 ? (
          <View style={{ marginTop: 12 }}>
            <EmptyState
              title="No teacher updates yet"
              message="When your child's teachers post a class note or announcement, you'll see it here."
            />
          </View>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {notes.map((n) => <NoteRow key={n.id} note={n} />)}
          </View>
        )}
      </View>

      {/* Support requests history */}
      {support.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginTop: 22, marginBottom: 12 }}>
          <Text style={styles.sectionEyebrow}>YOUR SUPPORT QUESTIONS</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            {support.map((s) => <SupportRow key={String(s.id)} req={s} />)}
          </View>
        </View>
      )}
    </AppScreen>
  );
}

const NoteRow: React.FC<{ note: TeacherNote }> = ({ note }) => (
  <View style={{ backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 14, ...shadows.xs }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.indigo[100], alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        <Ionicons name="megaphone-outline" size={16} color={palette.indigo[700]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold as any, color: colors.text.muted }}>
          {note.teacher_name || 'A teacher'}
        </Text>
        <Text style={{ fontSize: fontSize.xs - 1, color: colors.text.muted }}>
          {new Date(note.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
    <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
      {note.title}
    </Text>
    <Text style={{ fontSize: fontSize.xs, color: colors.text.body, marginTop: 6, lineHeight: fontSize.xs * 1.55 }}>
      {note.body}
    </Text>
  </View>
);

const STATUS_TINT: Record<string, { bg: string; fg: string }> = {
  open:      { bg: palette.amber[50],   fg: palette.amber[800]   },
  claimed:   { bg: palette.indigo[50],  fg: palette.indigo[700]  },
  resolved:  { bg: palette.emerald[50], fg: palette.emerald[800] },
  cancelled: { bg: palette.slate[200],  fg: palette.slate[700]   },
};

const SupportRow: React.FC<{ req: SupportRequestRow }> = ({ req }) => {
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

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
  sectionEyebrow: { fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, letterSpacing: 1.2, color: colors.text.muted },
} as const;
