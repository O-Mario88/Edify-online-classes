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
import { parentApi, type ParentHomePayload, type SubjectRow } from '@/api/parent.api';
import { useParentStore } from '@/auth/parentStore';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Subjects with weak topics, sorted by impact (count desc). Each row
 * links to the parent message screen so a parent can pick a teacher to
 * ask for help. The weak-topics list itself comes from the home
 * aggregator's `subjects[*].weak_topics` count.
 */
export default function ParentWeakTopics() {
  const router = useRouter();
  const selectedChildId = useParentStore((s) => s.selectedChildId);
  const [refreshing, setRefreshing] = useState(false);
  const query = useApiQuery<ParentHomePayload>(
    ['parent-home', selectedChildId],
    () => parentApi.home(selectedChildId ?? undefined),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const child = query.data?.selected_child;
  const subjects = (child?.subjects ?? []) as SubjectRow[];
  const weak = subjects
    .filter((s) => s.weak_topics > 0)
    .sort((a, b) => b.weak_topics - a.weak_topics);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Weak topics</Text>
        <Text style={styles.title}>{child ? `${child.name.split(' ')[0]}'s focus list` : 'Topics to revisit'}</Text>
        <Text style={styles.subtitle}>
          Subjects with the most topics still in red — sorted by impact, not alphabet.
        </Text>
      </View>

      {query.isLoading && !query.data ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : !child ? (
        <EmptyState title="No child selected" message="Pick a child from the home screen to see weak topics." />
      ) : weak.length === 0 ? (
        <EmptyState
          title="No weak topics flagged"
          message={`Great news — ${child.name.split(' ')[0]} has no topics in the danger zone right now.`}
        />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          {weak.map((s) => (
            <Pressable
              key={s.subject}
              onPress={() => router.push('/(parent)/messages' as any)}
              accessibilityRole="button"
              accessibilityLabel={`Message a teacher about ${s.subject}`}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface.raised,
                  borderRadius: radius.card,
                  padding: 14,
                  opacity: pressed ? 0.92 : 1,
                  ...shadows.xs,
                },
              ]}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: palette.rose[50], alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="flag-outline" size={18} color={palette.rose[800]} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
                  {s.subject}
                </Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }}>
                  {s.weak_topics} topic{s.weak_topics === 1 ? '' : 's'} need attention · last activity {s.last_activity}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.soft} />
            </Pressable>
          ))}
          <Text style={{ paddingHorizontal: 6, marginTop: 6, fontSize: fontSize.xs, color: colors.text.muted, lineHeight: fontSize.xs * 1.5 }}>
            Tap any subject to message the teacher and ask what to focus on at home.
          </Text>
        </View>
      )}
    </AppScreen>
  );
}

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
