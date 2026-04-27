import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { standbySupportApi, type MySupportRequest } from '@/api/learning.api';

const STATUS_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  open:     { bg: '#FEF3C7', fg: '#92400E', label: 'Waiting for a teacher' },
  claimed:  { bg: '#E0E7FF', fg: '#3730A3', label: 'A teacher is on it' },
  answered: { bg: '#D1FAE5', fg: '#065F46', label: 'Answered' },
};

/**
 * Support tracker — the learner's view of their standby questions.
 * Each request shows the live status and (when answered) the teacher
 * response. New questions are sent from the Ask-teacher screen which
 * this screen links to up top.
 */
export default function SupportTrackerScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const query = useApiQuery<MySupportRequest[]>(
    ['support-tracker'],
    () => standbySupportApi.myRequests(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Support</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Support tracker</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Every question you've sent and where it's at.
        </Text>
      </View>

      <View className="px-5 mb-4">
        <Pressable
          onPress={() => router.push('/(student)/ask-teacher' as any)}
          accessibilityRole="button"
          accessibilityLabel="Ask a new question"
          className="rounded-3xl p-4 flex-row items-center"
          style={{ backgroundColor: '#CCFBF1' }}
        >
          <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
            <Ionicons name="add" size={22} color="#115E59" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-teal-900">Ask a new question</Text>
            <Text className="text-xs text-teal-800 mt-0.5">
              Send a question to a standby teacher — usually answered within an hour.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#115E59" />
        </Pressable>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : items.length === 0 ? (
        <View className="px-5">
          <EmptyState
            title="No requests yet"
            message="Tap Ask a new question to send your first one."
          />
        </View>
      ) : (
        <View className="px-5">
          {items.map((r) => (
            <RequestCard
              key={String(r.id)}
              r={r}
              expanded={expanded === String(r.id)}
              onToggle={() => setExpanded(expanded === String(r.id) ? null : String(r.id))}
            />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

const RequestCard: React.FC<{
  r: MySupportRequest;
  expanded: boolean;
  onToggle: () => void;
}> = ({ r, expanded, onToggle }) => {
  const tint = STATUS_TINT[r.status] || STATUS_TINT.open;
  const answered = r.status === 'answered';
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={`Question ${r.id}`}
      className="bg-white rounded-2xl p-4 mb-3"
      style={cardShadow}
    >
      <View className="flex-row items-center mb-2">
        <View
          className="px-2 py-0.5 rounded-full mr-2"
          style={{ backgroundColor: tint.bg }}
        >
          <Text className="text-[10px] font-bold" style={{ color: tint.fg }}>{tint.label.toUpperCase()}</Text>
        </View>
        <Text className="text-[11px] text-slate-400 ml-auto">
          {new Date(r.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text numberOfLines={expanded ? undefined : 2} className="text-sm text-slate-800 leading-relaxed">
        {r.question}
      </Text>
      {expanded && answered && r.response && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
            Teacher's reply
          </Text>
          <Text className="text-sm text-slate-800 leading-relaxed">{r.response}</Text>
        </View>
      )}
    </Pressable>
  );
};
