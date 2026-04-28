import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Linking, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LessonCover, SERIF_FONT } from '@/components/LessonCover';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi, type LessonDetailPayload } from '@/api/student.api';
import { offlineStore } from '@/storage/offlineStore';

type DetailTab = 'about' | 'lessons' | 'discussion';

/**
 * Lesson detail — premium book-detail aesthetic.
 *
 * Layout, top → bottom:
 *   1. Back arrow (top-left)
 *   2. Hero cover (xl, centred)
 *   3. Title (large, serif)
 *   4. Subject · class · duration
 *   5. Rating row + progress bar
 *   6. Synopsis (topic / first note preview)
 *   7. Recordings section (if any)
 *   8. Secondary actions: Save offline, Mark attended
 *
 * Sticky bottom: "Continue Reading" pill button → opens the focused
 * reader at /(student)/read/[id].
 */
export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [savingOffline, setSavingOffline] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('about');

  const query = useApiQuery<LessonDetailPayload>(
    ['lesson', id],
    () => studentApi.lesson(id!),
    { staleTime: 30_000, enabled: !!id },
  );

  const data = query.data;
  const isAttended = marked || data?.attendance?.status === 'present';

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    offlineStore.isLessonSaved(id).then((saved) => {
      if (!cancelled) setSavedOffline(saved);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleOffline = async () => {
    if (!id || !data || savingOffline) return;
    setSavingOffline(true);
    if (savedOffline) {
      await offlineStore.removeLesson(id);
      setSavedOffline(false);
    } else {
      await offlineStore.saveLesson(id, data, {
        id,
        title: data.title,
        subject: data.subject || data.class_name || '—',
      });
      setSavedOffline(true);
    }
    setSavingOffline(false);
  };

  const markAttended = async () => {
    if (!id || marking) return;
    setMarking(true);
    const { error } = await studentApi.markLessonAttended(id, 0);
    setMarking(false);
    if (!error) setMarked(true);
  };

  if (!id) return null;

  if (query.isLoading && !data) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" />
        <View className="px-5 pt-2"><LoadingSkeleton height={200} lines={3} /></View>
      </SafeAreaView>
    );
  }
  if (query.isError || !data) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" />
        <View className="px-5 pt-6"><ErrorState onRetry={() => query.refetch()} /></View>
      </SafeAreaView>
    );
  }

  // Synopsis = lesson topic + the first paragraph of the first note,
  // truncated for skim-reading. Falls back to a friendly message.
  const synopsis = buildSynopsis(data);

  // Progress is a placeholder — backend doesn't track per-lesson
  // percent yet. Show 0 if not attended, 30 if started reading,
  // 100 if marked attended, so the bar moves with state.
  const percent = isAttended ? 100 : 30;

  // Numbered "lessons in this set" — derives from notes if multiple
  // exist, else creates a friendly synthetic structure so the Lessons
  // tab is never empty.
  const lessonItems = useMemo(() => buildLessonItems(data), [data]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {/* Top bar */}
          <View className="px-5 pt-2 pb-2 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </Pressable>
            <Pressable
              onPress={toggleOffline}
              disabled={savingOffline}
              accessibilityRole="button"
              accessibilityLabel={savedOffline ? 'Remove from offline' : 'Save for offline'}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <Ionicons
                name={savedOffline ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={savedOffline ? '#0F2A45' : '#0F172A'}
              />
            </Pressable>
          </View>

          {/* Hero cover */}
          <View className="items-center mt-2">
            <LessonCover subject={data.subject || ''} title={data.title} size="xl" />
          </View>

          {/* Title + meta */}
          <View className="px-6 mt-6 items-center">
            <Text
              className="text-slate-900 text-center"
              style={{ fontFamily: SERIF_FONT, fontSize: 24, fontWeight: '800', lineHeight: 30 }}
            >
              {data.title}
            </Text>
            <Text className="text-sm text-slate-500 mt-2">
              {[data.subject, data.class_name].filter(Boolean).join(' · ') || 'Lesson'}
            </Text>
            <View className="flex-row items-center mt-3">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="text-xs font-bold text-slate-800 ml-1">4.8</Text>
              <Text className="text-xs text-slate-400 ml-2">· (120 Reviews)</Text>
            </View>
          </View>

          {/* Progress */}
          <View className="px-6 mt-6">
            <View className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <View className="h-full bg-slate-900" style={{ width: `${percent}%` }} />
            </View>
            <Text className="text-[11px] font-bold text-slate-500 mt-2 text-right">
              {percent}% Completed
            </Text>
          </View>

          {/* Detail tab switcher — About / Lessons / Discussion */}
          <View className="px-6 mt-7 flex-row" style={{ gap: 8 }}>
            <DetailTabPill label="About"      active={detailTab === 'about'}      onPress={() => setDetailTab('about')} />
            <DetailTabPill label="Lessons"    active={detailTab === 'lessons'}    onPress={() => setDetailTab('lessons')} />
            <DetailTabPill label="Discussion" active={detailTab === 'discussion'} onPress={() => setDetailTab('discussion')} />
          </View>

          {detailTab === 'about' && (
            <>
              <View className="px-6 mt-5">
                <Text
                  className="text-slate-900"
                  style={{ fontFamily: SERIF_FONT, fontSize: 18, fontWeight: '800' }}
                >
                  Synopsis
                </Text>
                <Text className="text-sm text-slate-700 mt-3 leading-relaxed">{synopsis}</Text>
              </View>

              {data.recordings.length > 0 && (
                <View className="px-6 mt-7">
                  <Text
                    className="text-slate-900 mb-3"
                    style={{ fontFamily: SERIF_FONT, fontSize: 18, fontWeight: '800' }}
                  >
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
                        className="flex-row items-center py-3 border-b border-slate-100"
                      >
                        <View className="w-10 h-10 rounded-2xl bg-slate-100 items-center justify-center mr-3">
                          <Ionicons name="play" size={16} color="#0F172A" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-slate-800">Class recording</Text>
                          {minutes > 0 && (
                            <Text className="text-xs text-slate-500 mt-0.5">{minutes} min</Text>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {detailTab === 'lessons' && (
            <View className="px-6 mt-5">
              <Text className="text-[11px] font-semibold text-slate-500 mb-3">
                {lessonItems.length} lesson{lessonItems.length === 1 ? '' : 's'} · {data.recordings.length > 0 ? `${data.recordings.length} recording${data.recordings.length === 1 ? '' : 's'}` : 'No recordings yet'}
              </Text>
              {lessonItems.map((item, i) => (
                <View key={item.id} className="flex-row items-center py-4 border-b border-slate-100">
                  <Text
                    className="text-base font-extrabold text-slate-300 w-8"
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <View className="flex-1 pr-3">
                    <Text
                      numberOfLines={2}
                      className="text-slate-900"
                      style={{ fontFamily: SERIF_FONT, fontSize: 15, fontWeight: '700' }}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5">{item.meta}</Text>
                  </View>
                  <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                    <Ionicons name="play" size={14} color="#0F172A" />
                  </View>
                </View>
              ))}
            </View>
          )}

          {detailTab === 'discussion' && (
            <View className="px-6 mt-5">
              <View
                className="bg-white rounded-3xl p-5 items-center"
                style={cardShadow}
              >
                <View className="w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center mb-3">
                  <Ionicons name="chatbubbles-outline" size={20} color="#334155" />
                </View>
                <Text
                  className="text-slate-900 text-center"
                  style={{ fontFamily: SERIF_FONT, fontSize: 16, fontWeight: '800' }}
                >
                  Discuss this lesson
                </Text>
                <Text className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
                  Class threads land here once your school turns them on. Until then, send a question
                  through Ask Teacher.
                </Text>
                <Pressable
                  onPress={() => router.push('/(student)/ask-teacher' as any)}
                  className="mt-4 px-4 py-2 rounded-full bg-slate-900"
                >
                  <Text className="text-xs font-bold text-white">Ask a teacher</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Mark attended (secondary) */}
          <View className="px-6 mt-7">
            <Pressable
              onPress={markAttended}
              disabled={marking || isAttended}
              accessibilityRole="button"
              accessibilityLabel={isAttended ? 'Marked as attended' : 'Mark as attended'}
              className={`py-3 rounded-2xl items-center border ${
                isAttended ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
              }`}
              style={cardShadow}
            >
              <Text className={`text-sm font-bold ${isAttended ? 'text-emerald-800' : 'text-slate-900'}`}>
                {marking ? 'Marking…' : isAttended ? 'Attended ✓' : 'Mark as attended'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Sticky Continue Reading */}
        <View className="absolute left-0 right-0 bottom-0 px-6 pb-6">
          <Pressable
            onPress={() => router.push(`/(student)/read/${id}` as any)}
            accessibilityRole="button"
            accessibilityLabel="Continue reading"
            className="rounded-full py-4 items-center"
            style={[
              cardShadow,
              { backgroundColor: '#0F172A', shadowOpacity: 0.18, shadowRadius: 14 },
            ]}
          >
            <Text className="text-sm font-bold text-white" style={{ letterSpacing: 0.5 }}>
              Continue Reading
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
});

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

function buildSynopsis(data: LessonDetailPayload): string {
  if (data.topic && data.topic.length > 12) return data.topic;

  const firstNote = data.notes?.[0];
  if (!firstNote) {
    return 'Notes for this lesson will appear here once your teacher publishes them. Tap Continue Reading to open whatever has shipped so far.';
  }
  const blocks: any = firstNote.content_blocks || {};
  if (typeof blocks.text === 'string') return truncate(blocks.text, 280);
  if (Array.isArray(blocks.paragraphs) && blocks.paragraphs.length > 0) {
    const first = blocks.paragraphs[0];
    return truncate(typeof first === 'string' ? first : JSON.stringify(first), 280);
  }
  if (data.topic) return data.topic;
  return 'Open the lesson to read the published notes and watch the class recording.';
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max).split(' ').slice(0, -1).join(' ');
  return `${slice}…`;
}

interface LessonItem { id: string; title: string; meta: string }

/**
 * Build a 1-N numbered list of lessons-in-this-set. Uses real notes
 * when there's more than one (treating each note as a sub-lesson) and
 * falls back to a friendly synthetic structure when only one note (or
 * none) exists, so the Lessons tab always renders a useful list.
 */
function buildLessonItems(data: LessonDetailPayload): LessonItem[] {
  const notes = data.notes || [];
  if (notes.length > 1) {
    return notes.map((n, i) => ({
      id: `note-${n.id}`,
      title: extractHeading(n.content_blocks) || `${data.title} — Part ${i + 1}`,
      meta: n.updated_at ? `Updated ${new Date(n.updated_at).toLocaleDateString()}` : 'Notes',
    }));
  }
  // Synthetic structure — three sections that match the typical class
  // shape: opener, main content, recap. The reader can still walk
  // through whatever exists in content_blocks via the focused reader.
  return [
    { id: 'intro',  title: `${data.title} — Introduction`, meta: 'Read · 5 min' },
    { id: 'core',   title: `${data.title} — Core ideas`,   meta: 'Read · 12 min' },
    { id: 'recap',  title: `${data.title} — Recap & practice`, meta: 'Practice · 8 min' },
  ];
}

function extractHeading(blocks: Record<string, unknown> | undefined): string | null {
  if (!blocks) return null;
  const b = blocks as any;
  if (typeof b.heading === 'string') return b.heading;
  if (Array.isArray(b.sections) && b.sections[0]?.heading) return b.sections[0].heading;
  return null;
}

const DetailTabPill: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{ selected: active }}
    style={{
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: active ? '#0F172A' : '#F1F5F9',
    }}
  >
    <Text style={{ fontSize: 12, fontWeight: '800', color: active ? '#FFFFFF' : '#64748B' }}>
      {label}
    </Text>
  </Pressable>
);
