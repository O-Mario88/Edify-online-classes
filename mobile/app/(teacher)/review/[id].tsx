import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { teacherApi } from '@/api/teacher.api';

type ReviewState = 'loading' | 'ready' | 'submitting' | 'submitted' | 'error';

interface ReviewDetail {
  id: number | string;
  title: string;
  kind: string;
  student_name?: string;
  subject?: string;
  submitted_at?: string;
  description?: string;
  body?: string;
  rubric?: { criterion: string; max_score: number; description?: string }[];
  attachments?: { kind: 'image' | 'audio' | 'file'; url: string; label?: string }[];
}

/**
 * Single-review screen — opens a project / essay / lab / exam-essay
 * submission, shows the rubric, captures a written response + score,
 * POSTs to /mentor-reviews/requests/<id>/respond/.
 *
 * Voice feedback is staged behind a "+ voice note" affordance for a
 * follow-up; for now we capture written feedback only so the wire
 * format is simple and testable.
 */
export default function TeacherReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [state, setState] = useState<ReviewState>('loading');
  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await teacherApi.reviewDetail(id);
      if (cancelled) return;
      if (err || !data) {
        setError(err?.message || 'Could not load this review.');
        setState('error');
        return;
      }
      setDetail(data as ReviewDetail);
      setState('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return null;

  const submit = async () => {
    if (!detail || feedback.trim().length < 4) {
      setError('Add a few lines of feedback before submitting.');
      return;
    }
    setError(null);
    setState('submitting');
    const numericScore = score ? Number(score) : undefined;
    const { error: err } = await teacherApi.respondReview(detail.id, {
      feedback,
      score: Number.isFinite(numericScore) ? numericScore : undefined,
    });
    if (err) {
      setError(err.message || 'Could not submit review. Try again.');
      setState('ready');
      return;
    }
    setState('submitted');
  };

  if (state === 'loading') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <View className="px-5 pt-6"><LoadingSkeleton height={120} lines={4} /></View>
      </SafeAreaView>
    );
  }
  if (state === 'error' || !detail) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <View className="px-5 pt-6"><ErrorState onRetry={() => setState('loading')} /></View>
      </SafeAreaView>
    );
  }
  if (state === 'submitted') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <View className="px-6 pt-12 items-center">
          <View className="w-14 h-14 rounded-full bg-emerald-100 items-center justify-center mb-3">
            <Ionicons name="checkmark" size={26} color="#065F46" />
          </View>
          <Text className="text-2xl font-extrabold text-slate-900 text-center">Review submitted</Text>
          <Text className="text-sm text-slate-600 mt-2 text-center max-w-sm">
            {detail.student_name ? <>{detail.student_name} will see your feedback shortly.</> : 'The student will see your feedback shortly.'}
          </Text>
          <Pressable
            onPress={() => router.replace('/(teacher)/reviews' as any)}
            className="mt-7 px-5 py-3 rounded-full bg-maple-900"
          >
            <Text className="text-sm font-bold text-white">Back to queue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            <View className="px-5 pt-2 pb-2 flex-row items-center">
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Back"
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={22} color="#0F172A" />
              </Pressable>
              <View className="flex-1 px-2">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {kindLabel(detail.kind)}
                </Text>
                <Text numberOfLines={1} className="text-base font-extrabold text-slate-900">{detail.title}</Text>
              </View>
            </View>

            <View className="px-5 mt-4">
              <View className="bg-slate-50 rounded-2xl p-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-2">
                    <Text className="text-[11px] font-extrabold text-slate-700">
                      {(detail.student_name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-slate-900">{detail.student_name || 'Anonymous'}</Text>
                  {detail.subject && (
                    <Text className="text-xs text-slate-500 ml-2">· {detail.subject}</Text>
                  )}
                </View>
                {!!detail.description && (
                  <Text className="text-xs text-slate-600 leading-relaxed mb-3">{detail.description}</Text>
                )}
                {!!detail.body && (
                  <Text className="text-sm text-slate-800 leading-relaxed">{detail.body}</Text>
                )}
              </View>
            </View>

            {detail.rubric && detail.rubric.length > 0 && (
              <View className="px-5 mt-6">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Rubric</Text>
                <View className="bg-white rounded-2xl p-4" style={cardShadow}>
                  {detail.rubric.map((r, i) => (
                    <View key={i} className={`flex-row ${i > 0 ? 'pt-3 mt-3 border-t border-slate-100' : ''}`}>
                      <View className="flex-1 pr-3">
                        <Text className="text-sm font-bold text-slate-900">{r.criterion}</Text>
                        {!!r.description && (
                          <Text className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.description}</Text>
                        )}
                      </View>
                      <Text className="text-[11px] font-bold text-slate-500">/ {r.max_score}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View className="px-5 mt-6">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Score (optional)</Text>
              <TextInput
                value={score}
                onChangeText={setScore}
                placeholder="e.g. 85"
                keyboardType="number-pad"
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900"
              />
            </View>

            <View className="px-5 mt-4">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Feedback</Text>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                placeholder="What's strong? What's the next thing to work on?"
                placeholderTextColor="#94A3B8"
                className="rounded-xl border border-slate-200 bg-white p-4 text-base text-slate-900 min-h-[200px]"
              />
            </View>

            {error && (
              <View className="px-5 mt-3">
                <View className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <Text className="text-sm font-medium text-rose-800">{error}</Text>
                </View>
              </View>
            )}

            <View className="px-5 mt-5 mb-2 flex-row" style={{ gap: 10 }}>
              <Pressable
                onPress={() => router.back()}
                className="flex-1 py-3 rounded-2xl items-center"
                style={{ backgroundColor: '#F1F5F9' }}
              >
                <Text className="text-sm font-bold text-slate-700">Save & exit</Text>
              </Pressable>
              <Pressable
                onPress={submit}
                disabled={state === 'submitting' || feedback.trim().length < 4}
                className="flex-1 py-3 rounded-2xl items-center"
                style={{ backgroundColor: feedback.trim().length < 4 ? '#CBD5E1' : '#0F2A45' }}
              >
                <Text className="text-sm font-bold text-white">
                  {state === 'submitting' ? 'Submitting…' : 'Submit review'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

function kindLabel(kind: string): string {
  switch (kind) {
    case 'project': return 'Project review';
    case 'essay': return 'Essay review';
    case 'lab_attempt': return 'Practice lab';
    case 'exam_essay': return 'Exam essay';
    default: return 'Review';
  }
}

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;
