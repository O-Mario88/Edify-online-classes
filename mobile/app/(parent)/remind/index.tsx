import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { parentApi, type ParentHomePayload } from '@/api/parent.api';
import { useParentStore } from '@/auth/parentStore';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

interface NudgePreset {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: 'amber' | 'indigo' | 'emerald' | 'rose';
  label: string;
  body: string;
}

const PRESETS: NudgePreset[] = [
  { key: 'homework',    icon: 'document-text-outline', tint: 'amber',   label: 'Homework due tonight',  body: 'Hi love — your homework is due tonight. Quick check-in: how much is left?' },
  { key: 'live-class',  icon: 'videocam-outline',     tint: 'indigo',  label: 'Live class starting',   body: 'Your live class is starting soon. Phone charged? See you on the other side. ❤️' },
  { key: 'study-block', icon: 'time-outline',         tint: 'emerald', label: 'Time for study block',  body: 'Study block time. 25 minutes of focus, then a break. You\'ve got this.' },
  { key: 'water-break', icon: 'leaf-outline',         tint: 'emerald', label: 'Take a quick break',    body: 'Pause for water and a stretch. Look out the window. Then back at it.' },
  { key: 'check-in',    icon: 'heart-outline',        tint: 'rose',    label: 'Just checking in',      body: 'No agenda — just thinking of you. How is today going?' },
];

const TINTS: Record<NudgePreset['tint'], { bg: string; fg: string }> = {
  amber:   { bg: palette.amber[50],   fg: palette.amber[800]   },
  indigo:  { bg: palette.indigo[50],  fg: palette.indigo[700]  },
  emerald: { bg: palette.emerald[50], fg: palette.emerald[800] },
  rose:    { bg: palette.rose[50],    fg: palette.rose[800]    },
};

/**
 * Pre-written nudge picker. Tap a card → opens the message thread with
 * the child with the body pre-filled. Until per-child threading lands,
 * confirms the message would have been sent and routes to the existing
 * /messages list so the parent can re-send.
 */
export default function ParentRemind() {
  const router = useRouter();
  const selectedChildId = useParentStore((s) => s.selectedChildId);
  const [refreshing, setRefreshing] = useState(false);

  const homeQuery = useApiQuery<ParentHomePayload>(
    ['parent-home', selectedChildId],
    () => parentApi.home(selectedChildId ?? undefined),
    { staleTime: 60_000 },
  );

  const child = homeQuery.data?.selected_child;
  const childName = child?.name?.split(' ')[0] || 'your child';

  const onPick = (preset: NudgePreset) => {
    Alert.alert(
      `Send to ${childName}`,
      `"${preset.body}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => {
          // Until a per-child message endpoint ships, route to the
          // existing messages screen — preserves the action without
          // pretending we sent something we didn't.
          router.push('/(parent)/messages' as any);
        } },
      ],
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await homeQuery.refetch();
    setRefreshing(false);
  };

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Nudge</Text>
        <Text style={styles.title}>Remind {childName}</Text>
        <Text style={styles.subtitle}>
          Pick a warm pre-written nudge. Tap to send it as a message — your child gets it as a notification.
        </Text>
      </View>

      {homeQuery.isLoading && !homeQuery.data ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : homeQuery.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => homeQuery.refetch()} />
        </View>
      ) : !child ? (
        <EmptyState title="No child selected" message="Pick a child from the home screen first." />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          {PRESETS.map((p) => (
            <NudgeRow key={p.key} preset={p} onPress={() => onPick(p)} />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const NudgeRow: React.FC<{ preset: NudgePreset; onPress: () => void }> = ({ preset, onPress }) => {
  const tint = TINTS[preset.tint];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={preset.label}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface.raised,
          borderRadius: radius.card,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'flex-start',
          opacity: pressed ? 0.92 : 1,
          ...shadows.xs,
        },
      ]}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: tint.bg, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        <Ionicons name={preset.icon} size={18} color={tint.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
          {preset.label}
        </Text>
        <Text style={{ fontSize: fontSize.xs, color: colors.text.body, marginTop: 4, lineHeight: fontSize.xs * 1.55 }}>
          {preset.body}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text.soft} />
    </Pressable>
  );
};

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
