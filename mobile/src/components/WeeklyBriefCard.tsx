import React from 'react';
import { View, Text } from 'react-native';
import { AppCard } from './AppCard';
import type { WeeklyBrief } from '@/api/parent.api';

interface WeeklyBriefCardProps {
  brief: WeeklyBrief;
  childFirstName: string;
}

/**
 * The headline parent surface: a one-paragraph weekly narrative + a
 * 3-up "Strongest / Attendance / Trend" mini-grid + a recommended
 * focus line. Mobile equivalent of the web Weekly Child Progress
 * Brief card.
 */
export const WeeklyBriefCard: React.FC<WeeklyBriefCardProps> = ({ brief, childFirstName }) => (
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

    <Text className="text-[10px] text-slate-400 mt-3">
      Built from lessons completed, practice activity, attendance, assessments, and teacher feedback.
    </Text>
  </AppCard>
);

const Cell: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <View className="flex-1 px-1.5">
    <View className="bg-slate-50 rounded-xl p-3">
      <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{label}</Text>
      <Text numberOfLines={1} className={`text-sm font-extrabold mt-1 ${accent}`}>{value}</Text>
    </View>
  </View>
);
