import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';

interface LiveClassCardProps {
  title: string;
  subject?: string;
  scheduledStart: string; // ISO
  durationMinutes?: number;
  meetingLink?: string;
}

/**
 * Live class summary card. Used on Home (next live) + Live tab list.
 * Surfaces the time relative to now ("in 2h 15m" / "tomorrow 10:00")
 * + a Join button when a meeting link is present and the session is
 * imminent (within 30 min of start) or already started.
 */
export const LiveClassCard: React.FC<LiveClassCardProps> = ({
  title, subject, scheduledStart, durationMinutes = 60, meetingLink,
}) => {
  const start = new Date(scheduledStart);
  const now = Date.now();
  const minsToStart = Math.round((start.getTime() - now) / 60_000);
  const isJoinable = meetingLink && minsToStart <= 30 && minsToStart >= -120;

  const whenLabel = (() => {
    if (minsToStart < -120) return 'Already ended';
    if (minsToStart < 0) return 'In progress';
    if (minsToStart < 60) return `Starts in ${minsToStart} min`;
    if (minsToStart < 60 * 12) return `Starts in ${Math.floor(minsToStart / 60)}h ${minsToStart % 60}m`;
    return start.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  })();

  return (
    <View
      className="rounded-2xl bg-blue-50 border border-blue-200 p-4 mb-2.5"
      accessibilityLabel={`Live class: ${title} ${whenLabel}`}
    >
      <Text className="text-[10px] uppercase tracking-wider font-bold text-blue-700">Live class · {whenLabel}</Text>
      <Text numberOfLines={2} className="text-base font-bold text-slate-900 mt-1 leading-snug">{title}</Text>
      {subject ? (
        <Text className="text-xs text-slate-600 mt-1">
          {subject}
          {durationMinutes ? ` · ${durationMinutes} min` : ''}
        </Text>
      ) : null}
      {isJoinable && (
        <Pressable
          onPress={() => Linking.openURL(meetingLink!).catch(() => {})}
          accessibilityRole="button"
          accessibilityLabel="Join live class"
          className="mt-3 self-start bg-maple-900 rounded-full px-4 py-2"
        >
          <Text className="text-white text-xs font-bold">Join class</Text>
        </Pressable>
      )}
    </View>
  );
};
