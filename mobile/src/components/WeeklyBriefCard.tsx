import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from './AppCard';
import { shareItem } from '@/hooks/useShare';
import type { WeeklyBrief } from '@/api/parent.api';
import { colors } from '@/theme';

interface WeeklyBriefCardProps {
  brief: WeeklyBrief;
  childFirstName: string;
}

/**
 * The headline parent surface: a one-paragraph weekly narrative + a
 * 3-up "Strongest / Attendance / Trend" mini-grid + a recommended
 * focus line. Mobile equivalent of the web Weekly Child Progress
 * Brief card. Bottom row offers a one-tap WhatsApp share so parents
 * can forward the brief to the school WhatsApp group or grandparents.
 */
export const WeeklyBriefCard: React.FC<WeeklyBriefCardProps> = ({ brief, childFirstName }) => {
  const onShare = () =>
    shareItem({
      title: `${childFirstName}'s weekly progress`,
      message: [
        brief.narrative,
        `\nStrongest subject: ${brief.strongest_subject}`,
        `Attendance: ${brief.attendance}%`,
        `Trend: ${brief.assessment_trend || '—'}`,
        `\nFocus next: ${brief.recommended_focus}`,
        `\n— shared from Maple Online School`,
      ].join('\n'),
    });
  return (
    <AppCard>
      <Text className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 mb-1">
        Weekly progress brief
      </Text>
      <Text className="text-sm text-slate-800 leading-relaxed">{brief.narrative}</Text>

      <View className="mt-4 flex-row -mx-1.5">
        <Cell label="Strongest" value={brief.strongest_subject} accent="text-emerald-700" />
        <Cell label="Attendance" value={`${brief.attendance}%`} accent={brief.attendance < 75 ? 'text-rose-600' : 'text-emerald-700'} />
        <Cell label="Trend" value={brief.assessment_trend || '—'} accent="text-slate-700" />
      </View>

      <View className="mt-4 pt-3 border-t border-slate-100">
        <Text className="text-[10px] uppercase tracking-wider font-bold text-indigo-800 mb-1">Recommended focus</Text>
        <Text className="text-xs text-slate-700 leading-relaxed">{brief.recommended_focus}</Text>
      </View>

      <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <Text className="text-[10px] text-slate-400 flex-1 pr-3">
          Built from lessons, practice, attendance, assessments, and teacher feedback.
        </Text>
        <Pressable
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="Share weekly brief via WhatsApp"
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: colors.partner.whatsapp }}
        >
          <Ionicons name="logo-whatsapp" size={14} color={colors.text.onBrand} />
          <Text className="text-[11px] font-bold text-white ml-1.5">Share</Text>
        </Pressable>
      </View>
    </AppCard>
  );
};

const Cell: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <View className="flex-1 px-1.5">
    <View className="bg-slate-50 rounded-xl p-3">
      <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{label}</Text>
      <Text numberOfLines={1} className={`text-sm font-extrabold mt-1 ${accent}`}>{value}</Text>
    </View>
  </View>
);
