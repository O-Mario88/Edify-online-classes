import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LessonCover, SERIF_FONT } from '@/components/LessonCover';
import { PromoBanner } from '@/components/PromoBanner';
import { SubjectChips, type SubjectChip } from '@/components/SubjectChips';
import { FeaturedCourseCard } from '@/components/FeaturedCourseCard';
import { TeacherChip } from '@/components/TeacherChip';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi, type RecentLesson, type StudentHomePayload } from '@/api/student.api';
import { useAuthStore } from '@/auth/authStore';
import { offlineStore, type SavedLessonMeta } from '@/storage/offlineStore';

type TabKey = 'recent' | 'saved' | 'live';

const SUBJECT_CHIPS: SubjectChip[] = [
  { key: 'all',      label: 'All',         icon: 'grid-outline',         tintBg: '#E2E8F0', tintFg: '#0F172A' },
  { key: 'maths',    label: 'Maths',       icon: 'calculator-outline',   tintBg: '#E0E7FF', tintFg: '#3730A3' },
  { key: 'science',  label: 'Science',     icon: 'flask-outline',        tintBg: '#D1FAE5', tintFg: '#065F46' },
  { key: 'english',  label: 'English',     icon: 'book-outline',         tintBg: '#FFE4E6', tintFg: '#9F1239' },
  { key: 'history',  label: 'History',     icon: 'time-outline',         tintBg: '#FEF3C7', tintFg: '#92400E' },
  { key: 'geography',label: 'Geography',   icon: 'globe-outline',        tintBg: '#CCFBF1', tintFg: '#115E59' },
  { key: 'art',      label: 'Art',         icon: 'color-palette-outline', tintBg: '#EDE9FE', tintFg: '#5B21B6' },
];

const TOP_TEACHERS = [
  { name: 'Mr. Okello',   subject: 'Mathematics', tint: '#1E3A8A' },
  { name: 'Mrs. Asiimwe', subject: 'Science',     tint: '#065F46' },
  { name: 'Mr. Nkwanga',  subject: 'English',     tint: '#9F1239' },
  { name: 'Ms. Kato',     subject: 'History',     tint: '#92400E' },
  { name: 'Mr. Mugisha',  subject: 'Geography',   tint: '#115E59' },
];

/**
 * Library — premium e-learning aesthetic.
 *
 * Sections, top → bottom:
 *   1. Greeting strip (avatar + Hi + search)
 *   2. Promo banner (navy / bronze hero with CTA)
 *   3. Subject chips (filter row)
 *   4. Featured this week (horizontal book-card carousel)
 *   5. Continue reading (large hero card with progress)
 *   6. Tabs: Recent / Saved offline / Live
 *   7. Vertical lesson list with cover thumbs + ratings
 *   8. Top teachers carousel
 *
 * Covers are generated client-side by `LessonCover` so the surface is
 * fully designed without per-lesson cover artwork.
 */
export default function LearnTab() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<TabKey>('recent');
  const [subject, setSubject] = useState<string>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedLessons, setSavedLessons] = useState<SavedLessonMeta[]>([]);

  const homeQuery = useApiQuery<StudentHomePayload>(
    ['student-home'],
    () => studentApi.home(),
    { staleTime: 60_000 },
  );

  const refreshSaved = async () => {
    const list = await offlineStore.listSavedLessons();
    setSavedLessons(list);
    setSavedIds(new Set(list.map((l) => String(l.id))));
  };
  useEffect(() => { void refreshSaved(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([homeQuery.refetch(), refreshSaved()]);
    setRefreshing(false);
  };

  const data = homeQuery.data;
  const firstName = (user?.full_name || data?.user?.full_name || 'there').split(' ')[0];
  const continueLesson: RecentLesson | undefined = data?.recent_lessons?.[0];
  const continuePct = Math.max(8, Math.min(100, data?.kpis?.overall_progress ?? 32));

  const filterBySubject = (l: RecentLesson) => {
    if (subject === 'all') return true;
    return (l.subject || '').toLowerCase().startsWith(subject);
  };

  const list: RecentLesson[] = useMemo(() => {
    if (!data) return [];
    if (tab === 'saved') {
      return savedLessons.map<RecentLesson>((s) => ({
        id: s.id,
        title: s.title,
        subject: s.subject,
        class_name: '',
        duration_label: 'Saved offline',
      }));
    }
    if (tab === 'live') {
      return data.next_live_session
        ? [
            {
              id: `live-${data.next_live_session.id}`,
              title: data.next_live_session.title,
              subject: data.next_live_session.subject,
              class_name: 'Live class',
              duration_label: `${data.next_live_session.duration_minutes} min`,
            },
          ]
        : [];
    }
    return (data.recent_lessons || []).filter(filterBySubject);
  }, [data, savedLessons, tab, subject]);

  const featured = (data?.recent_lessons || []).slice(0, 5);

  const toggleSave = async (lesson: RecentLesson) => {
    const idStr = String(lesson.id);
    if (savedIds.has(idStr)) {
      await offlineStore.removeLesson(lesson.id);
    } else {
      await offlineStore.saveLesson(lesson.id, lesson, {
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject || '—',
      });
    }
    await refreshSaved();
  };

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      {/* Greeting */}
      <View className="px-5 pt-6 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 min-w-0">
          <View className="w-11 h-11 rounded-full bg-white items-center justify-center mr-3" style={cardShadow}>
            <Text className="text-base font-extrabold text-slate-800">
              {(firstName[0] || '?').toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Library</Text>
            <Text
              className="text-slate-900 mt-0.5"
              style={{ fontSize: 22, fontFamily: SERIF_FONT, fontWeight: '800' }}
            >
              Hi, {firstName}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search library"
          className="w-11 h-11 rounded-full bg-white items-center justify-center"
          style={cardShadow}
        >
          <Ionicons name="search-outline" size={20} color="#334155" />
        </Pressable>
      </View>

      {/* Promo banner */}
      <View className="px-5 mt-5">
        <PromoBanner
          eyebrow="This week's focus"
          title="Sit a real-format mock and see your band."
          subtitle="The Exam Simulator predicts your grade and shows the topics that cost you marks."
          ctaLabel="Open simulator"
          onPress={() => router.push('/(student)/exam-sim' as any)}
        />
      </View>

      {/* Subject chips */}
      <View className="mt-6 pl-5">
        <SubjectChips chips={SUBJECT_CHIPS} selectedKey={subject} onSelect={setSubject} />
      </View>

      {/* Featured carousel */}
      {featured.length > 0 && (
        <View className="mt-7">
          <View className="px-5 flex-row items-end justify-between mb-3">
            <Text
              className="text-slate-900"
              style={{ fontFamily: SERIF_FONT, fontSize: 18, fontWeight: '800' }}
            >
              Featured this week
            </Text>
            <Text className="text-xs font-bold text-slate-500">View all</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
          >
            {featured.map((l) => {
              const idStr = String(l.id);
              return (
                <FeaturedCourseCard
                  key={idStr}
                  title={l.title}
                  subject={l.subject}
                  byline={l.class_name || l.subject}
                  rating={4.8}
                  studentCount={l.id ? (Number(l.id) % 9000) + 200 : 200}
                  badgeLabel={l.duration_label || undefined}
                  saved={savedIds.has(idStr)}
                  onPress={() => router.push(`/(student)/lesson/${idStr}` as any)}
                  onToggleSave={() => toggleSave(l)}
                />
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Continue reading hero */}
      {continueLesson && (
        <View className="px-5 mt-7">
          <Text
            className="text-slate-900 mb-3"
            style={{ fontFamily: SERIF_FONT, fontSize: 18, fontWeight: '800' }}
          >
            Continue reading
          </Text>
          <ContinueHero
            lesson={continueLesson}
            percent={continuePct}
            onPress={() => router.push(`/(student)/read/${continueLesson.id}` as any)}
          />
        </View>
      )}

      {/* Tab switcher */}
      <View className="px-5 mt-7">
        <Text
          className="text-slate-900 mb-3"
          style={{ fontFamily: SERIF_FONT, fontSize: 18, fontWeight: '800' }}
        >
          My library
        </Text>
        <View className="flex-row">
          <TabPill label="Recent"        active={tab === 'recent'} onPress={() => setTab('recent')} />
          <TabPill label="Saved offline" active={tab === 'saved'}  onPress={() => setTab('saved')}  />
          <TabPill label="Live"          active={tab === 'live'}   onPress={() => setTab('live')}   />
        </View>
      </View>

      {/* List */}
      <View className="px-5 mt-3">
        {homeQuery.isLoading && !data ? (
          <LoadingSkeleton height={84} lines={4} />
        ) : homeQuery.isError ? (
          <ErrorState onRetry={() => homeQuery.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            title={tab === 'saved' ? 'No saved lessons yet' : tab === 'live' ? 'No live class scheduled' : 'No lessons yet'}
            message={
              tab === 'saved'
                ? 'Open a lesson and tap Save for offline to keep it on your phone.'
                : tab === 'live'
                ? "Your teachers haven't scheduled a live class right now."
                : "When your teacher publishes a lesson it'll appear here."
            }
          />
        ) : (
          list.map((l, i) => (
            <LessonRow
              key={String(l.id)}
              index={i + 1}
              lesson={l}
              saved={savedIds.has(String(l.id))}
              onPress={() => router.push(`/(student)/lesson/${String(l.id).replace(/^live-/, '')}` as any)}
              onToggleSave={() => toggleSave(l)}
            />
          ))
        )}
      </View>

      {/* Top teachers */}
      <View className="mt-8 pl-5">
        <View className="pr-5 flex-row items-end justify-between mb-3">
          <Text
            className="text-slate-900"
            style={{ fontFamily: SERIF_FONT, fontSize: 18, fontWeight: '800' }}
          >
            Top teachers
          </Text>
          <Text className="text-xs font-bold text-slate-500">View all</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
          {TOP_TEACHERS.map((t) => (
            <TeacherChip key={t.name} name={t.name} subject={t.subject} tint={t.tint} />
          ))}
        </ScrollView>
      </View>
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

const ContinueHero: React.FC<{ lesson: RecentLesson; percent: number; onPress?: () => void }> = ({
  lesson, percent, onPress,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Continue reading ${lesson.title}`}
    className="bg-white rounded-3xl p-5 flex-row"
    style={cardShadow}
  >
    <LessonCover subject={lesson.subject} title={lesson.title} size="md" />
    <View className="flex-1 ml-4 justify-between">
      <View>
        <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Pick up where you left off
        </Text>
        <Text
          numberOfLines={2}
          className="text-slate-900 mt-1"
          style={{ fontFamily: SERIF_FONT, fontSize: 17, fontWeight: '800', lineHeight: 22 }}
        >
          {lesson.title}
        </Text>
        <Text className="text-xs text-slate-500 mt-1">
          {lesson.subject}{lesson.class_name ? ` · ${lesson.class_name}` : ''}
        </Text>
      </View>
      <View>
        <View className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <View className="h-full bg-slate-900" style={{ width: `${percent}%` }} />
        </View>
        <Text className="text-[10px] font-bold text-slate-500 mt-1.5">
          {percent}% completed
        </Text>
      </View>
    </View>
  </Pressable>
);

const TabPill: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{ selected: active }}
    className="mr-5 pb-2"
  >
    <Text
      className="text-sm"
      style={{ fontWeight: active ? '800' : '600', color: active ? '#0F172A' : '#94A3B8' }}
    >
      {label}
    </Text>
    {active && <View className="h-0.5 mt-2 bg-slate-900 rounded-full" />}
  </Pressable>
);

const LessonRow: React.FC<{
  lesson: RecentLesson;
  index: number;
  saved: boolean;
  onPress?: () => void;
  onToggleSave?: () => void;
}> = ({ lesson, index, saved, onPress, onToggleSave }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Open ${lesson.title}`}
    className="flex-row items-center py-3"
  >
    {/* Numbered prefix — modern e-learning convention */}
    <Text
      className="text-[11px] font-bold text-slate-400 w-6"
      style={{ fontVariant: ['tabular-nums'] }}
    >
      {String(index).padStart(2, '0')}
    </Text>
    <LessonCover subject={lesson.subject} title={lesson.title} size="sm" />
    <View className="flex-1 ml-3 pr-3">
      <Text
        numberOfLines={2}
        className="text-slate-900"
        style={{ fontFamily: SERIF_FONT, fontSize: 15, fontWeight: '700', lineHeight: 19 }}
      >
        {lesson.title}
      </Text>
      <Text numberOfLines={1} className="text-xs text-slate-500 mt-1">
        {lesson.subject}
        {lesson.class_name ? ` · ${lesson.class_name}` : ''}
      </Text>
      <View className="flex-row items-center mt-1.5">
        <Ionicons name="star" size={11} color="#F59E0B" />
        <Text className="text-[11px] font-bold text-slate-700 ml-1">4.8</Text>
        <Text className="text-[11px] text-slate-400 ml-2">· {lesson.duration_label}</Text>
      </View>
    </View>
    <Pressable
      onPress={onToggleSave}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from saved' : 'Save for later'}
      className="w-9 h-9 items-center justify-center"
    >
      <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? '#E11D48' : '#94A3B8'} />
    </Pressable>
  </Pressable>
);
