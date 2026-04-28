import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import {
  notificationPreferencesApi,
  type NotificationChannel,
  type NotificationPreference,
  type NotificationPreferencesPayload,
} from '@/api/notificationPreferences.api';

interface PrefDef {
  key: string;
  label: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  tintBg: string;
  tintFg: string;
  defaultEnabled: boolean;
  /** Channels available for this preference. */
  channels: NotificationChannel[];
}

const STUDENT_PREFS: PrefDef[] = [
  { key: 'live_class_reminder',  label: 'Live class starting',     body: 'Heads-up 10 minutes before a class begins.',           icon: 'videocam-outline',     tintBg: '#DBEAFE', tintFg: '#1E40AF', defaultEnabled: true,  channels: ['push'] },
  { key: 'assignment_due',       label: 'Assignment due soon',     body: 'Reminder the day before, and again on the morning.',   icon: 'time-outline',         tintBg: '#FEF3C7', tintFg: '#92400E', defaultEnabled: true,  channels: ['push'] },
  { key: 'teacher_feedback',     label: 'Teacher feedback ready',  body: 'When a project, essay, or mock is reviewed.',          icon: 'chatbubble-outline',   tintBg: '#E0E7FF', tintFg: '#3730A3', defaultEnabled: true,  channels: ['push', 'email'] },
  { key: 'support_answered',     label: 'Support reply ready',     body: 'When a standby teacher answers your question.',        icon: 'help-buoy-outline',    tintBg: '#CCFBF1', tintFg: '#115E59', defaultEnabled: true,  channels: ['push'] },
  { key: 'exam_practice',        label: 'Exam practice nudge',     body: 'Light nudges when you\'re due to practise.',           icon: 'reader-outline',       tintBg: '#FFE4E6', tintFg: '#9F1239', defaultEnabled: false, channels: ['push'] },
  { key: 'badge_earned',         label: 'Badge or certificate',    body: 'When you earn something for your Passport.',           icon: 'medal-outline',        tintBg: '#FFEDD5', tintFg: '#9A3412', defaultEnabled: true,  channels: ['push'] },
];

/**
 * Notification preferences — per-channel toggles + quiet-hours hint.
 * Backend endpoint /mobile/notification-preferences/ is TBD; we fetch
 * best-effort and fall back to the local default set so the screen is
 * always editable. Save POSTs the full payload; failures don't block
 * the UI — the optimistic state stays.
 */
export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreference[]>(() =>
    STUDENT_PREFS.map((d) => ({
      key: d.key,
      enabled: d.defaultEnabled,
      channels: d.channels,
    })),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await notificationPreferencesApi.fetch();
      if (cancelled) {
        setLoading(false);
        return;
      }
      if (data?.preferences && data.preferences.length > 0) {
        // Merge fetched values onto the local definitions so any new
        // pref the spec adds defaults to its built-in state.
        setPrefs((prev) =>
          prev.map((p) => {
            const remote = data.preferences.find((r) => r.key === p.key);
            return remote ? { ...p, ...remote } : p;
          }),
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = async (next: NotificationPreference[]) => {
    setSaving(true);
    setError(null);
    const payload: NotificationPreferencesPayload = { preferences: next };
    const { error: err } = await notificationPreferencesApi.save(payload);
    setSaving(false);
    if (err && err.status !== 404) {
      // 404 = endpoint not yet shipped — silent. Anything else, surface.
      setError(err.message || 'Could not save. Try again.');
    }
  };

  const togglePref = async (key: string) => {
    const next = prefs.map((p) => p.key === key ? { ...p, enabled: !p.enabled } : p);
    setPrefs(next);
    await persist(next);
  };

  const toggleChannel = async (key: string, channel: NotificationChannel) => {
    const next = prefs.map((p) => {
      if (p.key !== key) return p;
      const has = p.channels.includes(channel);
      return {
        ...p,
        channels: has ? p.channels.filter((c) => c !== channel) : [...p.channels, channel],
      };
    });
    setPrefs(next);
    await persist(next);
  };

  const byKey = useMemo(() => Object.fromEntries(prefs.map((p) => [p.key, p])), [prefs]);

  return (
    <AppScreen>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Settings</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Notification preferences</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Pick what's worth a buzz, and which channel it should arrive on.
        </Text>
      </View>

      {loading ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={4} /></View>
      ) : (
        <View className="px-5">
          {STUDENT_PREFS.map((def) => {
            const p = byKey[def.key];
            return (
              <PrefCard
                key={def.key}
                def={def}
                enabled={!!p?.enabled}
                channels={p?.channels || []}
                onToggle={() => togglePref(def.key)}
                onToggleChannel={(c) => toggleChannel(def.key, c)}
              />
            );
          })}

          {error && (
            <View className="p-3 rounded-xl bg-rose-50 border border-rose-200 mb-4">
              <Text className="text-sm font-medium text-rose-800">{error}</Text>
            </View>
          )}

          {/* Quiet hours hint */}
          <View className="bg-white rounded-2xl p-4 mb-2" style={cardShadow}>
            <View className="flex-row items-center mb-2">
              <View className="w-9 h-9 rounded-2xl bg-indigo-100 items-center justify-center mr-2.5">
                <Ionicons name="moon-outline" size={18} color="#3730A3" />
              </View>
              <Text className="text-sm font-extrabold text-slate-900">Quiet hours</Text>
            </View>
            <Text className="text-xs text-slate-600 leading-relaxed">
              Push notifications are silenced overnight (8pm–7am) and during scheduled study blocks. You
              can change quiet hours in your phone's Do-not-disturb settings.
            </Text>
          </View>

          {saving && (
            <Text className="text-[11px] text-slate-500 mt-1 text-center">Saving…</Text>
          )}
        </View>
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

const CHANNEL_LABEL: Record<NotificationChannel, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  push:     { label: 'Push',      icon: 'phone-portrait-outline' },
  email:    { label: 'Email',     icon: 'mail-outline' },
  whatsapp: { label: 'WhatsApp',  icon: 'logo-whatsapp' },
  sms:      { label: 'SMS',       icon: 'chatbubble-outline' },
};

const PrefCard: React.FC<{
  def: PrefDef;
  enabled: boolean;
  channels: NotificationChannel[];
  onToggle: () => void;
  onToggleChannel: (c: NotificationChannel) => void;
}> = ({ def, enabled, channels, onToggle, onToggleChannel }) => (
  <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
    <View className="flex-row items-center">
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: def.tintBg }}
      >
        <Ionicons name={def.icon} size={18} color={def.tintFg} />
      </View>
      <View className="flex-1 pr-2">
        <Text className="text-sm font-bold text-slate-900">{def.label}</Text>
        <Text className="text-xs text-slate-500 mt-0.5 leading-relaxed">{def.body}</Text>
      </View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled }}
        accessibilityLabel={def.label}
        className="w-12 h-7 rounded-full justify-center px-1"
        style={{ backgroundColor: enabled ? '#0F2A45' : '#E2E8F0' }}
      >
        <View
          className="w-5 h-5 rounded-full bg-white"
          style={{ marginLeft: enabled ? 'auto' : 0 }}
        />
      </Pressable>
    </View>

    {enabled && def.channels.length > 1 && (
      <View className="flex-row mt-3 pt-3 border-t border-slate-100" style={{ gap: 8 }}>
        {def.channels.map((c) => {
          const on = channels.includes(c);
          const meta = CHANNEL_LABEL[c];
          return (
            <Pressable
              key={c}
              onPress={() => onToggleChannel(c)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${meta.label} channel`}
              className="flex-row items-center px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: on ? '#0F172A' : '#F1F5F9',
                borderWidth: 1,
                borderColor: on ? '#0F172A' : '#E2E8F0',
              }}
            >
              <Ionicons name={meta.icon} size={12} color={on ? '#FFFFFF' : '#475569'} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: on ? '#FFFFFF' : '#475569',
                  marginLeft: 5,
                }}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    )}
  </View>
);
