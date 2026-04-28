import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { PhotoAttachField } from '@/components/PhotoAttachField';
import { VoiceAttachField } from '@/components/VoiceAttachField';
import type { CapturedPhoto } from '@/hooks/usePhotoCapture';
import type { VoiceClip } from '@/hooks/useVoiceRecorder';
import { useApiQuery } from '@/hooks/useApiQuery';
import {
  studentApi,
  type AssessmentDetailPayload,
  type AssessmentQuestion,
  type AssessmentSubmissionResponse,
} from '@/api/student.api';

/**
 * Mobile-first assessment player. One question per screen with a
 * progress bar at the top — the spec calls this out explicitly. The
 * answers are kept in local state until the learner taps Submit on
 * the last question; backend then auto-grades MCQs and the result
 * screen shows the score immediately.
 *
 * Phase 2.5 covers MCQ + short answer + essay (text). Photo upload
 * for handwritten work is Phase 7 with the camera permissions stack.
 */
export default function AssessmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Per-question photo attachment. Held client-side until the
  // /assessment/<id>/submit/ endpoint accepts multipart submissions —
  // capturing the UX path now so the wire-up later is a one-liner.
  const [photos, setPhotos] = useState<Record<string, CapturedPhoto | null>>({});
  // Per-question voice clip — same client-side staging as photos.
  const [voiceClips, setVoiceClips] = useState<Record<string, VoiceClip | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentSubmissionResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const query = useApiQuery<AssessmentDetailPayload>(
    ['assessment', id],
    () => studentApi.assessment(id!),
    { staleTime: 30_000, enabled: !!id },
  );

  const data = query.data;
  const questions: AssessmentQuestion[] = (data?.questions || []).slice().sort((a, b) => a.order - b.order);
  const total = questions.length;

  const submit = async () => {
    if (!id || submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    const { data: resp, error } = await studentApi.submitAssessment(id, answers);
    setSubmitting(false);
    if (error || !resp) {
      setSubmitError(error?.message || 'Submission failed. Please try again.');
      return;
    }
    setResult(resp);
  };

  // ── Loading / error / no-questions guards ─────────────────────
  if (!id) return null;

  if (query.isLoading && !data) {
    return (
      <AppScreen>
        <View className="px-5 pt-6"><LoadingSkeleton height={140} lines={3} /></View>
      </AppScreen>
    );
  }
  if (query.isError || !data) {
    return (
      <AppScreen>
        <View className="px-5 pt-6"><ErrorState onRetry={() => query.refetch()} /></View>
      </AppScreen>
    );
  }
  if (total === 0) {
    return (
      <AppScreen>
        <View className="px-5 pt-6">
          <Pressable onPress={() => router.back()} className="mb-6">
            <Text className="text-sm font-semibold text-maple-900">← Back</Text>
          </Pressable>
          <Text className="text-xl font-extrabold text-slate-900">{data.title}</Text>
          <Text className="text-sm text-slate-600 mt-2">
            This assessment has no questions yet. Check back when your teacher publishes it.
          </Text>
        </View>
      </AppScreen>
    );
  }

  // ── Result screen ─────────────────────────────────────────────
  if (result) {
    const isGraded = result.status === 'graded';
    return (
      <AppScreen>
        <View className="px-5 pt-12 items-center">
          <Text className="text-5xl mb-4">{isGraded ? '🎉' : '✅'}</Text>
          <Text className="text-2xl font-extrabold text-slate-900 text-center">
            {isGraded ? 'Submitted and graded' : 'Submitted'}
          </Text>
          <Text className="text-sm text-slate-600 text-center mt-2 max-w-sm">
            {isGraded
              ? `You scored ${result.total_score ?? 0} out of ${data.max_score}. Tap done to keep learning.`
              : 'Your teacher will grade essay answers. You\'ll get a notification when results are in.'}
          </Text>
          <View className="w-full max-w-xs mt-8">
            <PrimaryButton label="Done" onPress={() => router.back()} />
          </View>
        </View>
      </AppScreen>
    );
  }

  // ── Player ────────────────────────────────────────────────────
  const q = questions[step];
  const isLast = step === total - 1;
  const currentAnswer = answers[String(q.id)] || '';
  const currentPhoto = photos[String(q.id)] ?? null;
  const currentVoice = voiceClips[String(q.id)] ?? null;
  // Either typed text, an attached photo, or a voice clip counts as an
  // answer for essay/short-answer questions; MCQs still need a
  // selected option.
  const canAdvance =
    currentAnswer.trim().length > 0 ||
    (q.type !== 'mcq' && (!!currentPhoto || !!currentVoice));

  const setAnswer = (val: string) => setAnswers((prev) => ({ ...prev, [String(q.id)]: val }));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppScreen>
        <View className="px-5 pt-6 pb-3">
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Exit assessment">
            <Text className="text-sm font-semibold text-slate-600">← Exit</Text>
          </Pressable>
          <View className="mt-4">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {data.type} · Question {step + 1} of {total}
            </Text>
            <Text className="text-base font-bold text-slate-900 mt-1">{data.title}</Text>
            {/* Progress bar */}
            <View className="h-1.5 mt-3 bg-slate-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-maple-900 rounded-full"
                style={{ width: `${Math.round(((step + 1) / total) * 100)}%` }}
              />
            </View>
          </View>
        </View>

        <View className="px-5 space-y-4">
          <AppCard>
            <Text className="text-base font-semibold text-slate-900 leading-relaxed">{q.content}</Text>
            <Text className="text-[11px] text-slate-500 mt-2">
              Worth {q.marks} mark{Number(q.marks) === 1 ? '' : 's'}
            </Text>
          </AppCard>

          {q.type === 'mcq' ? (
            <View className="space-y-2">
              {(q.options || []).map((opt, i) => {
                const selected = currentAnswer === opt;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setAnswer(opt)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={opt}
                    className={`rounded-2xl border p-4 flex-row items-center gap-3 ${
                      selected ? 'bg-maple-900 border-maple-900' : 'bg-white border-slate-300'
                    }`}
                  >
                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      selected ? 'border-white' : 'border-slate-300'
                    }`}>
                      {selected && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </View>
                    <Text className={`flex-1 text-base font-medium ${selected ? 'text-white' : 'text-slate-800'}`}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View>
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {q.type === 'essay' ? 'Your essay' : 'Your answer'}
              </Text>
              <TextInput
                value={currentAnswer}
                onChangeText={setAnswer}
                multiline={q.type === 'essay'}
                numberOfLines={q.type === 'essay' ? 8 : 3}
                placeholder={q.type === 'essay' ? 'Write your full answer here…' : 'Type your answer'}
                placeholderTextColor="#94A3B8"
                textAlignVertical="top"
                className={`rounded-xl border border-slate-300 bg-white p-4 text-base text-slate-900 ${
                  q.type === 'essay' ? 'min-h-[180px]' : 'h-14'
                }`}
              />

              {/* Photo of handwritten work — works for math working,
                  diagrams, exercise-book pages, science setups, etc. */}
              <View className="mt-4">
                <PhotoAttachField
                  label="Or attach a photo of your working"
                  hint="Snap your exercise book — your teacher reads handwriting too."
                  value={photos[String(q.id)] ?? null}
                  onChange={(p) => setPhotos((prev) => ({ ...prev, [String(q.id)]: p }))}
                />
              </View>

              {/* Voice answer — useful for reading-fluency tasks and
                  speaking responses on language papers. */}
              <View className="mt-4">
                <VoiceAttachField
                  label="Or record a voice answer"
                  hint="Talk it through — handy for spoken English and oral exam practice."
                  value={voiceClips[String(q.id)] ?? null}
                  onChange={(c) => setVoiceClips((prev) => ({ ...prev, [String(q.id)]: c }))}
                />
              </View>
            </View>
          )}

          {submitError && (
            <View className="rounded-xl bg-rose-50 border border-rose-200 p-3">
              <Text className="text-sm font-medium text-rose-800">{submitError}</Text>
            </View>
          )}
        </View>

        <View className="px-5 mt-6 mb-10 flex-row gap-3">
          {step > 0 && (
            <View className="flex-1">
              <PrimaryButton label="Previous" variant="secondary" onPress={() => setStep((s) => Math.max(0, s - 1))} />
            </View>
          )}
          <View className="flex-[2]">
            {isLast ? (
              <PrimaryButton
                label="Submit"
                onPress={submit}
                loading={submitting}
                disabled={!canAdvance}
              />
            ) : (
              <PrimaryButton
                label="Next"
                onPress={() => setStep((s) => Math.min(total - 1, s + 1))}
                disabled={!canAdvance}
              />
            )}
          </View>
        </View>
      </AppScreen>
    </>
  );
}
