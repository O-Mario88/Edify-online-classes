import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { shadows } from '@/theme';

interface DayPillSelectorProps {
  /** Selected day index, 0=Mon … 6=Sun. */
  selectedIndex: number;
  onSelect: (index: number) => void;
  /** Optional dot under any day that has activity. */
  activityByIndex?: Record<number, number>;
  /** Optional dates to render under each label (e.g. ['25', '26', …]). */
  datesByIndex?: Record<number, number | string>;
}

const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Premium-minimal day-of-week selector. Each day is a white card with
 * the short label on top and the date number below. The selected day
 * fills with maple-navy and inverts its text — same restrained
 * "active dot" idea as the planner reference where today is just a
 * small dark filled pill on the calendar number.
 *
 * Layout matches the planner: small two-line cards, plenty of
 * whitespace, no chrome around inactive days.
 */
export const DayPillSelector: React.FC<DayPillSelectorProps> = ({
  selectedIndex,
  onSelect,
  activityByIndex = {},
  datesByIndex,
}) => {
  const todayIdx = useMemo(() => {
    // JS Date.getDay returns 0=Sun…6=Sat. We use 0=Mon…6=Sun.
    const js = new Date().getDay();
    return js === 0 ? 6 : js - 1;
  }, []);

  // If the caller didn't provide explicit dates, derive this week's
  // Mon→Sun calendar dates so the strip mirrors the user's actual week.
  const dates = useMemo(() => {
    if (datesByIndex) return datesByIndex;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayIdx = today.getDay();
    const daysSinceMonday = (dayIdx + 6) % 7;
    const monday = new Date(today);
    monday.setDate(monday.getDate() - daysSinceMonday);
    const map: Record<number, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      map[i] = d.getDate();
    }
    return map;
  }, [datesByIndex]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 12 }}
    >
      {SHORT.map((label, i) => {
        const active = i === selectedIndex;
        const isToday = i === todayIdx;
        const hasActivity = (activityByIndex[i] || 0) > 0;
        return (
          <Pressable
            key={label}
            onPress={() => onSelect(i)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${label} ${dates[i]}${isToday ? ', today' : ''}`}
            className={
              active
                ? 'w-14 h-16 rounded-2xl mr-2 bg-maple-900 items-center justify-center'
                : 'w-14 h-16 rounded-2xl mr-2 bg-white items-center justify-center'
            }
            style={active ? undefined : shadows.xs}
          >
            <Text className={active ? 'text-white text-[10px] font-bold tracking-wider uppercase' : 'text-slate-500 text-[10px] font-bold tracking-wider uppercase'}>
              {label}
            </Text>
            <Text className={active ? 'text-white text-lg font-extrabold mt-1' : 'text-slate-900 text-lg font-extrabold mt-1'}>
              {dates[i]}
            </Text>
            {hasActivity && !active && (
              <View className="w-1.5 h-1.5 rounded-full mt-0.5 bg-rose-500" />
            )}
            {hasActivity && active && (
              <View className="w-1.5 h-1.5 rounded-full mt-0.5 bg-white" />
            )}
            {!hasActivity && isToday && !active && (
              <View className="w-1.5 h-1.5 rounded-full mt-0.5 bg-maple-900" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};
