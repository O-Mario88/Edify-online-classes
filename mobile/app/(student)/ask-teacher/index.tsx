import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useApiQuery } from '@/hooks/useApiQuery';
import { standbySupportApi, type StandbyTeacherCard } from '@/api/learning.api';
import { PhotoAttachField } from '@/components/PhotoAttachField';
import type { CapturedPhoto } from '@/hooks/usePhotoCapture';

const SUBJECT_CHOICES = ['Maths', 'Science', 'English', 'History', 'Geography', 'ICT', 'Religion'];

/**
 * Ask a teacher — composes a standby support request. Shows a couple
 * of currently-online teachers up top so the learner knows the question
 * will reach a real human, picks a subject, types the question, and
 * optionally attaches a photo of working.
 *
 * POSTs to /standby-teachers/support-requests/. Photo upload to the
 * same endpoint will follow once the multipart parser ships there;
 * for now the photo is staged locally and we POST text + subject.
 */
export default function AskTeacherScreen() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState<string>('');
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teachersQuery = useApiQuery<StandbyTeacherCard[]>(
    ['standby-teachers-available'],
    () => standbySupportApi.availableTeachers(),
    { staleTime: 60_000 },
  );

  const submit = async () => {
    setError(null);
    if (question.trim().length < 8) {
      setError('Add a few more details so the teacher can help.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await standbySupportApi.ask({
      question,
      subject: subject || undefined,
    });
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Could not send your question. Try again.');
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <AppScreen>
        <View className="px-6 pt-12 items-center">
          <View className="w-14 h-14 rounded-full bg-emerald-100 items-center justify-center mb-3">
            <Ionicons name="paper-plane-outline" size={26} color="#065F46" />
          </View>
          <Text className="text-2xl font-extrabold text-slate-900 text-center">Question sent</Text>
          <Text className="text-sm text-slate-600 mt-2 text-center max-w-sm">
            A standby teacher will pick this up shortly. You'll get a notification when they reply.
          </Text>
          <View className="w-full max-w-xs mt-7" style={{ gap: 10 }}>
            <PrimaryButton
              label="Track my requests"
              onPress={() => router.replace('/(student)/support-tracker' as any)}
            />
            <Pressable onPress={() => router.back()} className="py-3 items-center">
              <Text className="text-sm font-bold text-slate-600">Back to dashboard</Text>
            </Pressable>
          </View>
        </View>
      </AppScreen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppScreen>
        <View className="px-5 pt-6 pb-3">
          <Pressable onPress={() => router.back()} className="mb-2">
            <Text className="text-sm font-semibold text-maple-900">← Back</Text>
          </Pressable>
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stuck?</Text>
          <Text className="text-2xl font-extrabold text-slate-900">Ask a teacher</Text>
          <Text className="text-sm text-slate-600 mt-1">
            Send a question to a real teacher. Median answer time during school hours: under an hour.
          </Text>
        </View>

        {/* Available teachers strip */}
        <View className="pl-5 mb-5">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            Online right now
          </Text>
          {teachersQuery.isLoading ? (
            <LoadingSkeleton height={72} lines={1} />
          ) : (
            <View className="flex-row pr-5">
              {(teachersQuery.data ?? []).slice(0, 4).map((t) => (
                <View key={String(t.id)} className="items-center mr-4 w-20">
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: '#0F2A45',
                      elevation: 1,
                      shadowColor: '#0F172A',
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 2 },
                    }}
                  >
                    <Text className="text-white text-sm font-extrabold">
                      {t.full_name.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                    </Text>
                  </View>
                  <Text numberOfLines={1} className="text-[11px] font-bold text-slate-900 mt-2 text-center">
                    {t.full_name.split(' ').slice(0, 2).join(' ')}
                  </Text>
                  <Text numberOfLines={1} className="text-[10px] text-emerald-700 mt-0.5 font-bold">
                    Online
                  </Text>
                </View>
              ))}
              {(teachersQuery.data ?? []).length === 0 && !teachersQuery.isLoading && (
                <Text className="text-xs text-slate-500 leading-relaxed pr-5">
                  No teachers online right now — questions are queued and answered as soon as one comes back.
                </Text>
              )}
            </View>
          )}
        </View>

        <View className="px-5" style={{ gap: 14 }}>
          {/* Subject chips */}
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Subject</Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {SUBJECT_CHOICES.map((s) => {
                const on = subject === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setSubject(on ? '' : s)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: on ? '#0F172A' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: on ? '#0F172A' : '#E2E8F0',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: on ? '#FFFFFF' : '#475569' }}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Your question</Text>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholder="Walk through what you're trying to do and where you're stuck."
              placeholderTextColor="#94A3B8"
              className="rounded-xl border border-slate-200 bg-white p-4 text-base text-slate-900 min-h-[160px]"
            />
          </View>

          <View>
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Optional photo</Text>
            <PhotoAttachField
              hint="Snap your working — handwriting is fine."
              value={photo}
              onChange={setPhoto}
            />
          </View>

          {error && (
            <View className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <Text className="text-sm font-medium text-rose-800">{error}</Text>
            </View>
          )}

          <View className="mt-1 mb-2">
            <PrimaryButton label="Send question" onPress={submit} loading={submitting} />
          </View>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}
