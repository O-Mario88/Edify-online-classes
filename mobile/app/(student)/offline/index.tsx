import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { EmptyState } from '@/components/EmptyState';
import { offlineStore, type OfflinePrefs, type SavedLessonMeta } from '@/storage/offlineStore';
import { notifyLowDataPrefChanged } from '@/hooks/useLowDataMode';

/**
 * Offline library — saved lessons + low-data preferences. Loads
 * synchronously from AsyncStorage so it works without a network round-
 * trip; pull-to-refresh re-reads the on-device cache.
 */
export default function OfflineScreen() {
  const router = useRouter();
  const [items, setItems] = useState<SavedLessonMeta[]>([]);
  const [prefs, setPrefs] = useState<OfflinePrefs>({ lowDataMode: false, preferAudioLessons: false });
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [list, p] = await Promise.all([offlineStore.listSavedLessons(), offlineStore.getPrefs()]);
    setItems(list);
    setPrefs(p);
  };

  useEffect(() => {
    void load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const togglePref = async (key: keyof OfflinePrefs) => {
    const next = await offlineStore.setPrefs({ [key]: !prefs[key] } as Partial<OfflinePrefs>);
    setPrefs(next);
    // Tell every active screen using useLowDataMode to re-read.
    if (key === 'lowDataMode' || key === 'preferAudioLessons') {
      notifyLowDataPrefChanged();
    }
  };

  const totalKb = items.reduce((sum, l) => sum + (l.sizeKb || 0), 0);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Offline</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Saved on device</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Read these lessons even without a signal. Data lives only on this phone.
        </Text>
      </View>

      <View className="px-5 mt-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Data preferences</Text>
        <PrefRow
          icon="cellular-outline"
          title="Low-data mode"
          body="Pause auto-playing video and load smaller images."
          value={prefs.lowDataMode}
          onToggle={() => togglePref('lowDataMode')}
        />
        <View className="h-3" />
        <PrefRow
          icon="headset-outline"
          title="Prefer audio lessons"
          body="When a lesson has both, default to the audio version."
          value={prefs.preferAudioLessons}
          onToggle={() => togglePref('preferAudioLessons')}
        />
      </View>

      <View className="px-5 mt-7">
        <View className="flex-row items-end justify-between mb-3">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Saved lessons</Text>
          {items.length > 0 && (
            <Text className="text-[11px] font-semibold text-slate-500">
              {items.length} item{items.length === 1 ? '' : 's'} · {Math.round(totalKb)} KB
            </Text>
          )}
        </View>

        {items.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            message={`Open a lesson and tap "Save for offline" to keep it on your phone.`}
          />
        ) : (
          items.map((l) => (
            <SavedRow
              key={String(l.id)}
              meta={l}
              onPress={() => router.push(`/(student)/lesson/${l.id}` as any)}
              onRemove={async () => {
                await offlineStore.removeLesson(l.id);
                await load();
              }}
            />
          ))
        )}
      </View>
    </AppScreen>
  );
}

const PrefRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  value: boolean;
  onToggle: () => void;
}> = ({ icon, title, body, value, onToggle }) => (
  <Pressable
    onPress={onToggle}
    accessibilityRole="switch"
    accessibilityState={{ checked: value }}
    accessibilityLabel={title}
    className="bg-white rounded-2xl p-4 flex-row items-center"
    style={{
      elevation: 1,
      shadowColor: '#0F172A',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    }}
  >
    <View className="w-10 h-10 rounded-2xl bg-indigo-100 items-center justify-center mr-3">
      <Ionicons name={icon} size={18} color="#3730A3" />
    </View>
    <View className="flex-1 pr-3">
      <Text className="text-sm font-bold text-slate-900">{title}</Text>
      <Text className="text-xs text-slate-500 mt-0.5">{body}</Text>
    </View>
    <View
      className={`w-12 h-7 rounded-full justify-center px-1 ${value ? 'bg-emerald-500' : 'bg-slate-200'}`}
    >
      <View
        className="w-5 h-5 rounded-full bg-white"
        style={{ marginLeft: value ? 'auto' : 0 }}
      />
    </View>
  </Pressable>
);

const SavedRow: React.FC<{
  meta: SavedLessonMeta;
  onPress: () => void;
  onRemove: () => void;
}> = ({ meta, onPress, onRemove }) => (
  <View
    className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
    style={{
      elevation: 1,
      shadowColor: '#0F172A',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    }}
  >
    <View className="w-10 h-10 rounded-2xl bg-emerald-100 items-center justify-center mr-3">
      <Ionicons name="cloud-done-outline" size={18} color="#065F46" />
    </View>
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${meta.title} offline`}
      className="flex-1 pr-3"
    >
      <Text numberOfLines={1} className="text-sm font-bold text-slate-900">{meta.title}</Text>
      <Text className="text-xs text-slate-500 mt-0.5">
        {meta.subject} · {meta.sizeKb} KB · saved {new Date(meta.savedAt).toLocaleDateString()}
      </Text>
    </Pressable>
    <Pressable
      onPress={onRemove}
      accessibilityRole="button"
      accessibilityLabel={`Remove ${meta.title} from offline`}
      className="px-2.5 py-1 rounded-full bg-rose-50"
    >
      <Text className="text-[11px] font-bold text-rose-700">Remove</Text>
    </Pressable>
  </View>
);
