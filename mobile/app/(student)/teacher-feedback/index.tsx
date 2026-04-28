import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { mentorReviewsApi, type MyMentorReview } from '@/api/learning.api';

const KIND_TINT: Record<string, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  project:     { bg: '#FFE4E6', fg: '#9F1239', icon: 'construct-outline' },
  essay:       { bg: '#E0E7FF', fg: '#3730A3', icon: 'create-outline' },
  lab_attempt: { bg: '#D1FAE5', fg: '#065F46', icon: 'flask-outline' },
  exam_essay:  { bg: '#FEF3C7', fg: '#92400E', icon: 'reader-outline' },
};

/**
 * Teacher feedback timeline — every review the student has received,
 * grouped into Pending / Completed. Tapping a card expands the
 * feedback inline. Filtering happens via the kind chips.
 */
export default function TeacherFeedbackScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const query = useApiQuery<MyMentorReview[]>(
    ['teacher-feedback'],
    () => mentorReviewsApi.myRequests(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];
  const completed = items.filter((r) => r.status === 'completed');
  const pending = items.filter((r) => r.status !== 'completed');

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Feedback</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Teacher feedback</Text>
        <Text className="text-sm text-slate-600 mt-1">
          What your teachers said about your projects, essays, and mocks.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : items.length === 0 ? (
        <View className="px-5">
          <EmptyState
            title="No feedback yet"
            message="Submit a project, essay, or exam attempt and your teacher's review will appear here."
          />
        </View>
      ) : (
        <View className="px-5">
          {pending.length > 0 && (
            <Section label={`Pending · ${pending.length}`}>
              {pending.map((r) => <FeedbackCard key={String(r.id)} r={r} expanded={expanded === String(r.id)} onToggle={() => setExpanded(expanded === String(r.id) ? null : String(r.id))} />)}
            </Section>
          )}
          {completed.length > 0 && (
            <Section label={`Completed · ${completed.length}`}>
              {completed.map((r) => <FeedbackCard key={String(r.id)} r={r} expanded={expanded === String(r.id)} onToggle={() => setExpanded(expanded === String(r.id) ? null : String(r.id))} />)}
            </Section>
          )}
        </View>
      )}
    </AppScreen>
  );
}

const Section: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
  <View className="mb-5">
    <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">{label}</Text>
    {children}
  </View>
);

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

const FeedbackCard: React.FC<{
  r: MyMentorReview;
  expanded: boolean;
  onToggle: () => void;
}> = ({ r, expanded, onToggle }) => {
  const tint = KIND_TINT[r.kind] || KIND_TINT.essay;
  const completed = r.status === 'completed';
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={r.title}
      className="bg-white rounded-2xl p-4 mb-3"
      style={cardShadow}
    >
      <View className="flex-row items-center">
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: tint.bg }}
        >
          <Ionicons name={tint.icon} size={20} color={tint.fg} />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">{r.title}</Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            {r.subject ? `${r.subject} · ` : ''}{kindLabel(r.kind)}
            {r.score != null ? ` · ${r.score}` : ''}
          </Text>
        </View>
        {completed ? (
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
        ) : (
          <View className="px-2 py-0.5 rounded-full bg-amber-100">
            <Text className="text-[10px] font-bold text-amber-800">PENDING</Text>
          </View>
        )}
      </View>
      {expanded && completed && r.feedback && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          <Text className="text-sm text-slate-800 leading-relaxed">{r.feedback}</Text>
          {r.reviewed_at && (
            <Text className="text-[11px] text-slate-400 mt-2">
              Reviewed {new Date(r.reviewed_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

function kindLabel(kind: string): string {
  switch (kind) {
    case 'project': return 'Project';
    case 'essay': return 'Essay';
    case 'lab_attempt': return 'Lab attempt';
    case 'exam_essay': return 'Exam essay';
    default: return 'Review';
  }
}
