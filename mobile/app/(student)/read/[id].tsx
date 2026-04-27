import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi, type LessonDetailPayload } from '@/api/student.api';
import { LessonCover, SERIF_FONT } from '@/components/LessonCover';

interface Section {
  heading?: string;
  paragraphs: string[];
  /** Treated as a pull-quote when present. */
  quote?: string;
}

/**
 * Focused reading mode. Editorial typography (large serif heading,
 * generous body line-height, pull-quote with left rule) plus three
 * specific upgrades from the Studiall reader reference:
 *
 *   1. Chapter hero — small subject-coloured cover sits above the
 *      chapter eyebrow so each section feels like content, not chrome.
 *   2. Bottom action bar — semantic actions (favourite / comment /
 *      notes count) on the left and a concrete "Page X of Y →"
 *      progress indicator on the right.
 *   3. Highlight popover — a "+" button on the action bar opens a
 *      colour palette + copy + translate row. Tap-to-toggle so we
 *      don't depend on RN's flaky text-selection callbacks.
 */
export default function ReadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chapterIdx, setChapterIdx] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);

  const query = useApiQuery<LessonDetailPayload>(
    ['lesson', id],
    () => studentApi.lesson(id!),
    { staleTime: 30_000, enabled: !!id },
  );

  const data = query.data;
  const sections = useMemo(() => buildSections(data ?? undefined), [data]);
  const total = sections.length;
  const current = sections[chapterIdx];

  // Estimate "pages" from paragraph count — three paragraphs per page
  // gives a believable count without tracking scroll position.
  const { pageNum, totalPages } = useMemo(() => {
    const pagesIn = (s: Section | undefined) =>
      Math.max(1, Math.ceil((s?.paragraphs?.length || 1) / 3));
    const before = sections.slice(0, chapterIdx).reduce((sum, s) => sum + pagesIn(s), 0);
    const all = sections.reduce((sum, s) => sum + pagesIn(s), 0);
    return { pageNum: before + 1, totalPages: all };
  }, [sections, chapterIdx]);

  if (!id) return null;

  if (query.isLoading && !data) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View className="px-6 pt-4"><LoadingSkeleton height={200} lines={5} /></View>
      </SafeAreaView>
    );
  }
  if (query.isError || !data) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View className="px-6 pt-6"><ErrorState onRetry={() => query.refetch()} /></View>
      </SafeAreaView>
    );
  }

  const chapterNum = String(chapterIdx + 1).padStart(2, '0');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" />

        {/* Top bar — back + lesson title eyebrow + overflow */}
        <View className="px-5 pt-2 pb-3 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close reader"
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </Pressable>
          <View className="flex-1 items-center">
            <Text className="text-sm font-extrabold text-slate-900">{data.title}</Text>
            <Text className="text-[11px] text-slate-500 mt-0.5">
              Chapter {chapterIdx + 1} {current?.heading ? `· ${current.heading}` : ''}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="More options"
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#0F172A" />
          </Pressable>
        </View>

        {/* Body */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Chapter hero — small subject cover, rounded, centred */}
          <View className="items-center mb-5">
            <LessonCover subject={data.subject || ''} title={current?.heading || data.title} size="md" />
          </View>

          <Text
            className="text-slate-900"
            style={{
              color: '#3B82F6',
              fontSize: 13,
              fontWeight: '700',
              letterSpacing: 0.4,
            }}
          >
            Chapter {chapterNum}
          </Text>
          <Text
            className="text-slate-900 mt-2"
            style={{
              fontFamily: SERIF_FONT,
              fontSize: 26,
              fontWeight: '800',
              lineHeight: 33,
              letterSpacing: -0.4,
            }}
          >
            {current?.heading || data.title}
          </Text>

          <View className="mt-5" style={{ gap: 16 }}>
            {(current?.paragraphs || []).map((p, i) => (
              <Text
                key={i}
                selectable
                className="text-slate-800"
                style={{ fontFamily: SERIF_FONT, fontSize: 16, lineHeight: 26 }}
              >
                {p}
              </Text>
            ))}
          </View>

          {current?.quote && (
            <View className="mt-7 pl-5 border-l-[3px] border-slate-900">
              <Text
                selectable
                className="text-slate-900"
                style={{
                  fontFamily: SERIF_FONT,
                  fontSize: 20,
                  fontStyle: 'italic',
                  fontWeight: '600',
                  lineHeight: 30,
                }}
              >
                "{current.quote}"
              </Text>
            </View>
          )}

          {/* Chapter navigation */}
          {total > 1 && (
            <View className="flex-row items-center justify-between mt-12 pt-5 border-t border-slate-100">
              <Pressable
                onPress={() => setChapterIdx((i) => Math.max(0, i - 1))}
                disabled={chapterIdx === 0}
                accessibilityRole="button"
                accessibilityLabel="Previous chapter"
                className="flex-row items-center"
              >
                <Ionicons
                  name="arrow-back"
                  size={18}
                  color={chapterIdx === 0 ? '#CBD5E1' : '#0F172A'}
                />
                <Text
                  className="text-sm font-semibold ml-2"
                  style={{ color: chapterIdx === 0 ? '#CBD5E1' : '#0F172A' }}
                >
                  Previous
                </Text>
              </Pressable>
              <Text className="text-xs text-slate-400">
                Chapter {chapterIdx + 1} of {total}
              </Text>
              <Pressable
                onPress={() => setChapterIdx((i) => Math.min(total - 1, i + 1))}
                disabled={chapterIdx >= total - 1}
                accessibilityRole="button"
                accessibilityLabel="Next chapter"
                className="flex-row items-center"
              >
                <Text
                  className="text-sm font-semibold mr-2"
                  style={{ color: chapterIdx >= total - 1 ? '#CBD5E1' : '#0F172A' }}
                >
                  Next
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={chapterIdx >= total - 1 ? '#CBD5E1' : '#0F172A'}
                />
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Bottom utility bar */}
        <View className="absolute left-0 right-0 bottom-0 bg-white border-t border-slate-100">
          {highlightOpen && (
            <View className="px-6 pt-3 pb-2 flex-row items-center justify-center" style={{ gap: 4 }}>
              <ColorDot color="#FCA5A5" />
              <ColorDot color="#93C5FD" />
              <ColorDot color="#86EFAC" />
              <ColorDot color="#FCD34D" />
              <ColorDot color="#C4B5FD" />
              <View style={{ width: 1, height: 18, backgroundColor: '#E2E8F0', marginHorizontal: 8 }} />
              <ToolButton icon="copy-outline" />
              <ToolButton icon="language-outline" />
              <ToolButton icon="text-outline" />
            </View>
          )}
          <View className="px-6 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Pressable
                onPress={() => setFavorited((f) => !f)}
                accessibilityRole="button"
                accessibilityLabel={favorited ? 'Remove from favourites' : 'Add to favourites'}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons
                  name={favorited ? 'star' : 'star-outline'}
                  size={20}
                  color={favorited ? '#F59E0B' : '#475569'}
                />
              </Pressable>
              <Pressable
                onPress={() => setHighlightOpen((o) => !o)}
                accessibilityRole="button"
                accessibilityLabel={highlightOpen ? 'Hide highlight tools' : 'Show highlight tools'}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons
                  name={highlightOpen ? 'chevron-down-outline' : 'chatbubble-outline'}
                  size={20}
                  color="#475569"
                />
              </Pressable>
              <View className="ml-1 flex-row items-center bg-slate-100 rounded-full px-2.5 py-1">
                <Text className="text-[11px] font-bold text-slate-700" style={{ fontVariant: ['tabular-nums'] }}>
                  99
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setChapterIdx((i) => Math.min(total - 1, i + 1))}
              disabled={chapterIdx >= total - 1}
              accessibilityRole="button"
              accessibilityLabel="Next page"
              className="flex-row items-center"
            >
              <Text
                className="text-sm font-bold text-slate-900 mr-3"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                Page <Text className="text-slate-900">{pageNum}</Text>
                <Text className="text-slate-400"> of {totalPages}</Text>
              </Text>
              <View
                className="w-9 h-9 rounded-full bg-slate-900 items-center justify-center"
                style={{
                  opacity: chapterIdx >= total - 1 ? 0.4 : 1,
                }}
              >
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const ColorDot: React.FC<{ color: string }> = ({ color }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Highlight colour"
    className="w-9 h-9 items-center justify-center"
  >
    <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: color }} />
  </Pressable>
);

const ToolButton: React.FC<{ icon: keyof typeof Ionicons.glyphMap }> = ({ icon }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={String(icon)}
    className="w-9 h-9 items-center justify-center"
  >
    <Ionicons name={icon} size={18} color="#475569" />
  </Pressable>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
});

/**
 * Turn a LessonDetailPayload into reader sections. Accepts the
 * `content_blocks` shapes the existing lesson screen handles
 * ({text}, {paragraphs[]}, raw string) plus a heading/quote-aware
 * shape ({heading, paragraphs[], quote}). Falls back to a single
 * "no notes yet" section if the lesson has no published notes.
 */
function buildSections(data?: LessonDetailPayload): Section[] {
  if (!data) return [];
  const sections: Section[] = [];

  if (data.topic) {
    sections.push({
      heading: data.title,
      paragraphs: [data.topic],
    });
  }

  for (const note of data.notes || []) {
    const b: any = note.content_blocks || {};
    if (typeof b === 'string') {
      sections.push({ paragraphs: [b] });
      continue;
    }
    if (Array.isArray(b.sections)) {
      b.sections.forEach((s: any) => {
        sections.push({
          heading: typeof s.heading === 'string' ? s.heading : undefined,
          paragraphs: Array.isArray(s.paragraphs) ? s.paragraphs.filter((p: unknown) => typeof p === 'string') : [],
          quote: typeof s.quote === 'string' ? s.quote : undefined,
        });
      });
      continue;
    }
    if (Array.isArray(b.paragraphs)) {
      sections.push({
        heading: typeof b.heading === 'string' ? b.heading : undefined,
        paragraphs: b.paragraphs.filter((p: unknown) => typeof p === 'string'),
        quote: typeof b.quote === 'string' ? b.quote : undefined,
      });
      continue;
    }
    if (typeof b.text === 'string') {
      sections.push({
        heading: typeof b.heading === 'string' ? b.heading : undefined,
        paragraphs: [b.text],
      });
      continue;
    }
  }

  if (sections.length === 0) {
    sections.push({
      heading: data.title,
      paragraphs: [
        'Notes for this lesson have not been published yet.',
        "Once your teacher publishes their class notes, you'll see them here in this focused reading view.",
      ],
    });
  }

  return sections;
}
