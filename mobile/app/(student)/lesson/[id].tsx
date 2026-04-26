import React, { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi, type LessonDetailPayload } from '@/api/student.api';

/**
 * Lesson viewer. Powered by /mobile/lesson/<id>/ aggregator (one
 * round-trip for lesson + notes + recordings + attendance).
 *
 * Phase 2.5 supports text-block notes (rendered from content_blocks
 * JSON) and links out to recordings (open in browser / native player).
 * Native PDF rendering + offline caching land in Phase 7.
 */
export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);

  const query = useApiQuery<LessonDetailPayload>(
    ['lesson', id],
    () => studentApi.lesson(id!),
    { staleTime: 30_000, enabled: !!id },
  );

  const data = query.data;
  const isAttended = marked || data?.attendance?.status === 'present';

  const markAttended = async () => {
    if (!id || marking) return;
    setMarking(true);
    const { error } = await studentApi.markLessonAttended(id, 0);
    setMarking(false);
    if (!error) setMarked(true);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppScreen>
        <View className="px-5 pt-6 pb-4">
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
            <Text className="text-sm font-semibold text-maple-900">← Back</Text>
          </Pressable>
        </View>

        <View className="px-5 space-y-4">
          {query.isLoading && !data ? (
            <LoadingSkeleton height={140} lines={3} />
          ) : query.isError ? (
            <ErrorState onRetry={() => query.refetch()} />
          ) : data ? (
            <>
              <View>
                <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {[data.subject, data.class_name].filter(Boolean).join(' · ') || 'Lesson'}
                </Text>
                <Text className="text-2xl font-extrabold text-slate-900 mt-1 leading-tight">{data.title}</Text>
                {!!data.topic && <Text className="text-sm text-slate-600 mt-1">{data.topic}</Text>}
              </View>

              {data.notes.length > 0 ? (
                data.notes.map((note) => (
                  <AppCard key={note.id}>
                    <NoteBlocks blocks={note.content_blocks} />
                  </AppCard>
                ))
              ) : (
                <AppCard>
                  <Text className="text-sm text-slate-600 leading-relaxed">
                    Notes for this lesson will appear here once your teacher publishes them.
                  </Text>
                </AppCard>
              )}

              {data.recordings.length > 0 && (
                <AppCard>
                  <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Recordings
                  </Text>
                  {data.recordings.map((r) => {
                    const minutes = Math.round((r.duration_seconds || 0) / 60);
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => Linking.openURL(r.url).catch(() => {})}
                        accessibilityRole="button"
                        accessibilityLabel="Open recording"
                        className="flex-row items-center gap-3 py-3 border-b border-slate-100 last:border-b-0"
                      >
                        <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center">
                          <Text className="text-xl">▶️</Text>
                        </View>
                        <View className="flex-1 min-w-0">
                          <Text className="text-sm font-semibold text-slate-800">Open recording</Text>
                          {minutes > 0 && (
                            <Text className="text-xs text-slate-500 mt-0.5">{minutes} min</Text>
                          )}
                        </View>
                        <Text className="text-slate-400 text-base">›</Text>
                      </Pressable>
                    );
                  })}
                </AppCard>
              )}

              <View className="pt-2">
                <PrimaryButton
                  label={isAttended ? 'Marked as attended ✓' : 'Mark as attended'}
                  variant={isAttended ? 'secondary' : 'primary'}
                  loading={marking}
                  onPress={markAttended}
                  disabled={isAttended}
                />
              </View>
            </>
          ) : null}
        </View>
      </AppScreen>
    </>
  );
}

/**
 * Render the LessonNote.content_blocks JSON. The web app stores notes
 * as a flexible block structure — for the pilot we handle the common
 * shapes (string text, {text}, {paragraphs[]}) and fall back to
 * stringifying anything we don't recognise so nothing silently drops.
 */
const NoteBlocks: React.FC<{ blocks: Record<string, unknown> }> = ({ blocks }) => {
  if (!blocks || (typeof blocks === 'object' && Object.keys(blocks).length === 0)) {
    return (
      <Text className="text-sm text-slate-600 leading-relaxed">
        This lesson has no published notes yet.
      </Text>
    );
  }
  // Common shapes we know about.
  if (typeof (blocks as any).text === 'string') {
    return <Text className="text-sm text-slate-800 leading-relaxed">{(blocks as any).text}</Text>;
  }
  const paras = (blocks as any).paragraphs;
  if (Array.isArray(paras)) {
    return (
      <View className="space-y-3">
        {paras.map((p: any, i: number) => (
          <Text key={i} className="text-sm text-slate-800 leading-relaxed">
            {typeof p === 'string' ? p : JSON.stringify(p)}
          </Text>
        ))}
      </View>
    );
  }
  // Last resort: pretty-print so the learner sees *something* honest.
  return (
    <Text className="text-xs text-slate-600 leading-relaxed font-mono">
      {JSON.stringify(blocks, null, 2)}
    </Text>
  );
};
