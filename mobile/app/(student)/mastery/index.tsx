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
  masteryApi,
  type MasteryEnrollment,
  type MasteryTrack,
} from '@/api/learning.api';

/**
 * Mastery Tracks — structured pathways. Two streams: My tracks (active
 * enrollments with progress) and Browse (catalogue you can enroll in).
 */
export default function MasteryTracksScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const tracksQuery = useApiQuery<MasteryTrack[]>(
    ['mastery-tracks'],
    () => masteryApi.tracks(),
    { staleTime: 60_000 },
  );
  const myQuery = useApiQuery<MasteryEnrollment[]>(
    ['mastery-my'],
    () => masteryApi.myTracks(),
    { staleTime: 60_000 },
  );

  const tracks = tracksQuery.data ?? [];
  const my = myQuery.data ?? [];
  const enrolledIds = new Set(my.map((e) => String(e.track_id)));
  const browseable = tracks.filter((t) => !enrolledIds.has(String(t.id)));

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([tracksQuery.refetch(), myQuery.refetch()]);
    setRefreshing(false);
  };

  const isLoading = (tracksQuery.isLoading && tracks.length === 0) || (myQuery.isLoading && my.length === 0);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pathways</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Mastery Tracks</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Subject-by-subject pathways with milestones, projects, and a certificate at the end.
        </Text>
      </View>

      {isLoading ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : tracksQuery.isError ? (
        <View className="px-5"><ErrorState onRetry={() => tracksQuery.refetch()} /></View>
      ) : (
        <>
          {my.length > 0 && (
            <View className="px-5 mb-5">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                My tracks
              </Text>
              {my.map((e) => <EnrollmentRow key={String(e.id)} e={e} />)}
            </View>
          )}

          <View className="px-5">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              {browseable.length === 0 && my.length === 0 ? 'Tracks' : 'Discover more'}
            </Text>
            {browseable.length === 0 && my.length === 0 ? (
              <EmptyState
                title="No tracks yet"
                message="Mastery tracks for your subjects will appear here once they're published."
              />
            ) : browseable.length === 0 ? (
              <Text className="text-xs text-slate-500 leading-relaxed">
                You're enrolled in every available track. New tracks land as your school adds them.
              </Text>
            ) : (
              browseable.map((t) => (
                <TrackRow
                  key={String(t.id)}
                  track={t}
                  onEnroll={async () => {
                    await masteryApi.enroll(t.id);
                    await myQuery.refetch();
                  }}
                />
              ))
            )}
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

const EnrollmentRow: React.FC<{ e: MasteryEnrollment }> = ({ e }) => (
  <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
    <View className="flex-row items-center">
      <View className="w-11 h-11 rounded-2xl bg-rose-100 items-center justify-center mr-3">
        <Ionicons name="trophy-outline" size={20} color="#9F1239" />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-rose-700">{e.subject}</Text>
        <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900 mt-0.5">{e.track_title}</Text>
      </View>
      {e.certificate_eligible && (
        <View className="px-2 py-0.5 rounded-full bg-amber-100">
          <Text className="text-[10px] font-bold text-amber-800">CERT EARNED</Text>
        </View>
      )}
    </View>
    <View className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-3">
      <View
        className="h-full"
        style={{ width: `${Math.max(4, Math.min(100, e.progress_percent))}%`, backgroundColor: '#9F1239' }}
      />
    </View>
    <View className="flex-row items-center justify-between mt-2">
      <Text className="text-[11px] font-bold text-slate-700">{e.progress_percent}% complete</Text>
      {!!e.next_item_title && (
        <Text numberOfLines={1} className="text-[11px] text-slate-500 ml-3 flex-1 text-right">
          Next: {e.next_item_title}
        </Text>
      )}
    </View>
  </View>
);

const TrackRow: React.FC<{ track: MasteryTrack; onEnroll: () => void }> = ({ track, onEnroll }) => (
  <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
    <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
      {track.subject}{track.level ? ` · ${track.level}` : ''}
    </Text>
    <Text className="text-base font-extrabold text-slate-900 mt-1">{track.title}</Text>
    {!!track.description && (
      <Text numberOfLines={2} className="text-xs text-slate-600 mt-1 leading-relaxed">{track.description}</Text>
    )}
    <View className="flex-row items-center justify-between mt-3">
      {track.modules_count != null && (
        <Text className="text-[11px] text-slate-500">{track.modules_count} modules</Text>
      )}
      <Pressable
        onPress={onEnroll}
        accessibilityRole="button"
        accessibilityLabel={`Enroll in ${track.title}`}
        className="px-4 py-2 rounded-full bg-maple-900"
      >
        <Text className="text-xs font-bold text-white">Enroll</Text>
      </Pressable>
    </View>
  </View>
);
