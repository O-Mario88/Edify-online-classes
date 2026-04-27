import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import {
  examSimulatorApi,
  type ExamAttempt,
  type ExamSimulation,
  type ReadinessReport,
} from '@/api/learning.api';

/**
 * Exam Simulator — three streams: a readiness summary at the top
 * (per-subject band + weak topics), in-progress / completed attempts,
 * and the catalogue of available timed mocks.
 */
export default function ExamSimulatorScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const examsQuery = useApiQuery<ExamSimulation[]>(
    ['exam-sim-exams'],
    () => examSimulatorApi.exams(),
    { staleTime: 60_000 },
  );
  const attemptsQuery = useApiQuery<ExamAttempt[]>(
    ['exam-sim-my'],
    () => examSimulatorApi.myAttempts(),
    { staleTime: 60_000 },
  );
  const readinessQuery = useApiQuery<ReadinessReport[]>(
    ['exam-sim-readiness'],
    () => examSimulatorApi.readiness(),
    { staleTime: 60_000 },
  );

  const exams = examsQuery.data ?? [];
  const attempts = attemptsQuery.data ?? [];
  const readiness = readinessQuery.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([examsQuery.refetch(), attemptsQuery.refetch(), readinessQuery.refetch()]);
    setRefreshing(false);
  };

  const isLoading = (examsQuery.isLoading && exams.length === 0)
    || (attemptsQuery.isLoading && attempts.length === 0);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Exam preparation</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Exam Simulator</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Sit a real-format mock and see your band. We'll point at the topics costing you marks.
        </Text>
      </View>

      {readiness.length > 0 && (
        <View className="px-5 mb-5">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Readiness</Text>
          {readiness.map((r) => <ReadinessRow key={r.subject} r={r} />)}
          <Text className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Readiness estimates are based on your completed mocks and recent practice. Not a guarantee.
          </Text>
        </View>
      )}

      {isLoading ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : examsQuery.isError ? (
        <View className="px-5"><ErrorState onRetry={() => examsQuery.refetch()} /></View>
      ) : (
        <>
          {attempts.length > 0 && (
            <View className="px-5 mb-5">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">My attempts</Text>
              {attempts.slice(0, 5).map((a) => <AttemptRow key={String(a.id)} a={a} />)}
            </View>
          )}

          <View className="px-5">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Available mocks</Text>
            {exams.length === 0 ? (
              <EmptyState
                title="No mocks ready yet"
                message="When your school publishes a timed mock for your level, it'll appear here."
              />
            ) : (
              exams.map((e) => (
                <ExamRow
                  key={String(e.id)}
                  exam={e}
                  onStart={async () => {
                    await examSimulatorApi.start(e.id);
                    await attemptsQuery.refetch();
                  }}
                />
              ))
            )}
          </View>

          <View className="px-5 mt-7 mb-2">
            <Pressable
              onPress={() => router.push('/(student)/mistake-notebook' as any)}
              accessibilityRole="button"
              accessibilityLabel="Open mistake notebook"
              className="rounded-3xl p-4 flex-row items-center"
              style={{ backgroundColor: '#FEF3C7' }}
            >
              <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
                <Ionicons name="bookmark-outline" size={22} color="#92400E" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-amber-900">Open mistake notebook</Text>
                <Text className="text-xs text-amber-800 mt-0.5">
                  Re-attempt the questions costing you marks across mocks.
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#92400E" />
            </Pressable>
          </View>
        </>
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

const ReadinessRow: React.FC<{ r: ReadinessReport }> = ({ r }) => (
  <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
    <View className="flex-row items-center">
      <View className="flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">{r.subject}</Text>
        <Text className="text-base font-extrabold text-slate-900 mt-0.5">Band {r.band}</Text>
      </View>
      <Text className="text-2xl font-extrabold text-indigo-700">{r.readiness_pct}%</Text>
    </View>
    <View className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-3">
      <View className="h-full bg-indigo-700" style={{ width: `${Math.max(4, Math.min(100, r.readiness_pct))}%` }} />
    </View>
    {r.weak_topics?.length > 0 && (
      <Text className="text-xs text-slate-600 mt-3 leading-relaxed">
        <Text className="font-bold">Weak topics: </Text>{r.weak_topics.slice(0, 4).join(', ')}
      </Text>
    )}
    {!!r.recommended_focus && (
      <Text className="text-xs text-slate-600 mt-1 leading-relaxed">
        <Text className="font-bold">Focus: </Text>{r.recommended_focus}
      </Text>
    )}
  </View>
);

const AttemptRow: React.FC<{ a: ExamAttempt }> = ({ a }) => {
  const done = a.status === 'completed';
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center" style={cardShadow}>
      <View
        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: done ? '#D1FAE5' : '#FEF3C7' }}
      >
        <Ionicons
          name={done ? 'checkmark-done-outline' : 'time-outline'}
          size={20}
          color={done ? '#065F46' : '#92400E'}
        />
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">{a.exam_title}</Text>
        <Text className="text-xs text-slate-500 mt-0.5">
          {a.subject} · {done ? 'Completed' : 'In progress'}
          {a.score != null ? ` · ${a.score}%` : ''}
          {a.band ? ` · Band ${a.band}` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </View>
  );
};

const ExamRow: React.FC<{ exam: ExamSimulation; onStart: () => void }> = ({ exam, onStart }) => (
  <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
    <Text className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
      {exam.subject}{exam.level ? ` · ${exam.level}` : ''}
    </Text>
    <Text className="text-base font-extrabold text-slate-900 mt-1">{exam.title}</Text>
    <Text className="text-xs text-slate-500 mt-1">
      {exam.duration_minutes} min{exam.questions_count ? ` · ${exam.questions_count} questions` : ''}
    </Text>
    <Pressable
      onPress={onStart}
      accessibilityRole="button"
      accessibilityLabel={`Start ${exam.title}`}
      className="mt-3 self-start px-4 py-2 rounded-full bg-maple-900"
    >
      <Text className="text-xs font-bold text-white">Start mock</Text>
    </Pressable>
  </View>
);
