import React from 'react';
import { View, Text, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import type { TodayPayload } from '@/api/student.api';
import { PrimaryButton } from './PrimaryButton';

interface TodayHeroProps {
  payload: TodayPayload | null;
}

/**
 * Mobile twin of the web TodayHero. Same payload shape, same severity
 * → colour mapping, but built for a phone-first vertical stack:
 * title + message at top, full-width action button at the bottom.
 *
 * action_link can be a relative app route (router.push) or an
 * external URL (Linking.openURL — handy for live-class meeting links).
 */
export const TodayHero: React.FC<TodayHeroProps> = ({ payload }) => {
  const router = useRouter();
  if (!payload) return null;

  const sev = payload.severity;
  const surface =
    sev === 'warning' ? 'bg-amber-50 border-amber-200' :
    sev === 'info'    ? 'bg-indigo-50 border-indigo-200' :
                        'bg-emerald-50 border-emerald-200';
  const eyebrowColor =
    sev === 'warning' ? 'text-amber-800' :
    sev === 'info'    ? 'text-indigo-800' :
                        'text-emerald-800';
  const eyebrowLabel =
    sev === 'warning' ? "Today · Needs attention" :
    sev === 'info'    ? "Today · Heads up" :
                        "Today · You're good";

  const onAction = () => {
    const link = payload.action_link;
    if (!link) return;
    if (/^https?:\/\//i.test(link)) {
      Linking.openURL(link).catch(() => {});
      return;
    }
    // Map web routes onto mobile equivalents. We keep the mapping
    // narrow on purpose — anything we haven't built yet falls to the
    // student home rather than 404-ing.
    if (link.includes('/grading')) router.push('/(student)');
    else if (link.includes('/classes')) router.push('/(student)');
    else if (link.includes('/live-sessions')) router.push('/(student)');
    else router.push('/(student)');
  };

  return (
    <View
      className={`rounded-2xl border p-5 ${surface}`}
      style={{
        elevation: 1,
        shadowColor: '#0F172A',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Text className={`text-[11px] font-bold uppercase tracking-wider ${eyebrowColor} mb-1`}>
        {eyebrowLabel}
      </Text>
      <Text className="text-lg font-extrabold text-slate-900 leading-snug">{payload.title}</Text>
      {!!payload.message && (
        <Text className="text-sm text-slate-700 mt-1.5 leading-relaxed">{payload.message}</Text>
      )}
      <View className="mt-4">
        <PrimaryButton label={payload.action_label || 'Open'} onPress={onAction} />
      </View>
    </View>
  );
};
