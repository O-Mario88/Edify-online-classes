import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { passportApi, type PassportSnapshot } from '@/api/learning.api';
import { shareItem } from '@/hooks/useShare';

/**
 * Learning Passport — verified record of progress. Shows badges /
 * certificates / projects-reviewed counts, recent entries timeline,
 * and a share toggle that flips the passport between private and
 * public-link mode. WhatsApp share lifts the public link straight
 * into a parent's chat.
 */
export default function PassportScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);

  const query = useApiQuery<PassportSnapshot>(
    ['passport'],
    () => passportApi.myPassport(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const data = query.data;

  const togglePublic = async () => {
    if (!data) return;
    setSharing(true);
    if (data.is_public) {
      await passportApi.stopSharing();
    } else {
      Alert.alert(
        'Make Passport public?',
        'Anyone with the link will be able to see your verified milestones. You can revoke any time.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setSharing(false) },
          {
            text: 'Make public',
            onPress: async () => {
              await passportApi.share({ make_public: true });
              await query.refetch();
              setSharing(false);
            },
          },
        ],
      );
      return;
    }
    await query.refetch();
    setSharing(false);
  };

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verified record</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Learning Passport</Text>
        <Text className="text-sm text-slate-600 mt-1">
          A verifiable record of everything you've completed at Maple.
        </Text>
      </View>

      {query.isLoading && !data ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : !data ? null : (
        <>
          {/* Hero counts */}
          <View className="px-5">
            <View
              className="rounded-3xl p-5"
              style={{ backgroundColor: '#0F2A45' }}
            >
              <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Your Passport</Text>
              <View className="flex-row mt-3">
                <Stat value={data.badges} label="Badges" />
                <Stat value={data.certificates} label="Certificates" />
                <Stat value={data.projects_reviewed} label="Projects" />
              </View>
            </View>
          </View>

          {/* Share controls */}
          <View className="px-5 mt-5">
            <View className="bg-white rounded-2xl p-4" style={cardShadow}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                  style={{ backgroundColor: data.is_public ? '#FEF3C7' : '#E2E8F0' }}
                >
                  <Ionicons
                    name={data.is_public ? 'globe-outline' : 'lock-closed-outline'}
                    size={18}
                    color={data.is_public ? '#92400E' : '#475569'}
                  />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-extrabold text-slate-900">
                    {data.is_public ? 'Public link active' : 'Private'}
                  </Text>
                  <Text numberOfLines={2} className="text-xs text-slate-500 mt-0.5">
                    {data.is_public
                      ? 'Anyone with the link can verify your milestones.'
                      : 'Only you can see your Passport. Turn on a public link to share with a parent or admissions office.'}
                  </Text>
                </View>
                <Pressable
                  onPress={togglePublic}
                  disabled={sharing}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: !!data.is_public }}
                  className="w-12 h-7 rounded-full justify-center px-1"
                  style={{ backgroundColor: data.is_public ? '#0F2A45' : '#E2E8F0' }}
                >
                  <View
                    className="w-5 h-5 rounded-full bg-white"
                    style={{ marginLeft: data.is_public ? 'auto' : 0 }}
                  />
                </Pressable>
              </View>

              {data.is_public && data.share_url && (
                <Pressable
                  onPress={() =>
                    shareItem({
                      title: 'My Maple Learning Passport',
                      message: 'A verified record of my learning at Maple Online School.',
                      url: data.share_url || undefined,
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Share Passport via WhatsApp"
                  className="mt-3 py-2.5 rounded-full flex-row items-center justify-center"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                  <Text className="text-xs font-bold text-white ml-2">Share via WhatsApp</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Recent entries timeline */}
          <View className="px-5 mt-7">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Recent entries
            </Text>
            {(data.recent_entries || []).length === 0 ? (
              <View className="bg-white rounded-2xl p-4" style={cardShadow}>
                <Text className="text-sm text-slate-600 leading-relaxed">
                  Complete a lesson, lab, or project to earn your first Passport entry.
                </Text>
              </View>
            ) : (
              data.recent_entries.map((e, i) => (
                <View key={`${e.title}-${i}`} className="flex-row items-start mb-3">
                  <View className="w-2 h-2 rounded-full bg-slate-900 mt-2 mr-3" />
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {e.kind}
                    </Text>
                    <Text className="text-sm font-bold text-slate-900 mt-0.5">{e.title}</Text>
                    <Text className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(e.issued_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View className="px-5 mt-5 mb-2">
            <Pressable
              onPress={() => router.push('/(student)/certificates' as any)}
              className="bg-white rounded-2xl p-4 flex-row items-center"
              style={cardShadow}
            >
              <View className="w-10 h-10 rounded-2xl bg-orange-100 items-center justify-center mr-3">
                <Ionicons name="medal-outline" size={20} color="#9A3412" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-slate-900">All certificates</Text>
                <Text className="text-xs text-slate-500 mt-0.5">View, download, and verify your full credential list.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
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

const Stat: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <View className="flex-1">
    <Text className="text-3xl font-extrabold text-white">{value}</Text>
    <Text className="text-[11px] font-bold text-amber-200 mt-1">{label}</Text>
  </View>
);
