import React from 'react';
import { View, Text } from 'react-native';
import type { SubjectRow } from '@/api/parent.api';

interface SubjectProgressRowProps {
  subject: SubjectRow;
}

/**
 * One row in the parent's subject-progress list. Surfaces completion %,
 * average score (rose-tinted when <60), weak topic count, and a
 * confidence chip. Stacked-card friendly — scales fine on a 320px
 * iPhone SE without the column wrapping seen on the web table.
 */
export const SubjectProgressRow: React.FC<SubjectProgressRowProps> = ({ subject }) => {
  const lowScore = subject.avg_score < 60;
  const confTone =
    subject.confidence === 'High' ? 'bg-emerald-100 text-emerald-700' :
    subject.confidence === 'Low'  ? 'bg-rose-100 text-rose-700' :
                                    'bg-amber-100 text-amber-700';
  return (
    <View className="bg-white rounded-2xl border border-slate-200 p-4 mb-2.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-slate-900 flex-1 pr-3" numberOfLines={1}>
          {subject.subject}
        </Text>
        <View className={`rounded-full px-2.5 py-1 ${confTone}`}>
          <Text className="text-[11px] font-bold">{subject.confidence}</Text>
        </View>
      </View>

      {/* Completion bar */}
      <View className="mt-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-[11px] font-semibold text-slate-500">Completion</Text>
          <Text className="text-[11px] font-bold text-slate-700">{subject.completion}%</Text>
        </View>
        <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <View
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${Math.max(0, Math.min(100, subject.completion))}%` }}
          />
        </View>
      </View>

      <View className="mt-3 flex-row gap-4">
        <View className="flex-1">
          <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Avg score</Text>
          <Text className={`text-base font-extrabold mt-0.5 ${lowScore ? 'text-rose-600' : 'text-emerald-700'}`}>
            {subject.avg_score}%
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Weak topics</Text>
          <Text className={`text-base font-extrabold mt-0.5 ${subject.weak_topics > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {subject.weak_topics}
          </Text>
        </View>
      </View>

      {!!subject.last_activity && (
        <Text className="text-[11px] text-slate-500 mt-3">Last activity: {subject.last_activity}</Text>
      )}
    </View>
  );
};
