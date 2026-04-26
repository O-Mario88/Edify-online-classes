import React from 'react';
import { View, Text } from 'react-native';
import { AppCard } from './AppCard';
import type { PassportSummary } from '@/api/parent.api';

interface PassportPreviewCardProps {
  passport: PassportSummary;
  childFirstName: string;
}

/**
 * Three-up evidence-of-progress strip. Counts come from the parent
 * home aggregator (badges from PracticeLabAttempt.badge_earned,
 * certificates from passport.Credential, projects_reviewed from
 * mastery_projects.ProjectSubmission). Honest empty state when the
 * learner hasn't earned anything yet — no flattering fakes.
 */
export const PassportPreviewCard: React.FC<PassportPreviewCardProps> = ({ passport, childFirstName }) => {
  const total = (passport.badges || 0) + (passport.certificates || 0) + (passport.projects_reviewed || 0);
  return (
    <AppCard>
      <Text className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1">
        Learning Passport
      </Text>
      <Text className="text-sm text-slate-700 leading-relaxed">
        {total > 0
          ? `${childFirstName} has built up real evidence of progress.`
          : `${childFirstName}'s Passport fills in as they earn badges, complete projects, and finish tracks.`}
      </Text>
      <View className="mt-4 flex-row -mx-1.5">
        <Cell label="Badges"          value={passport.badges} icon="🏅" />
        <Cell label="Certificates"    value={passport.certificates} icon="📜" />
        <Cell label="Projects"        value={passport.projects_reviewed} icon="🎯" />
      </View>
    </AppCard>
  );
};

const Cell: React.FC<{ label: string; value: number; icon: string }> = ({ label, value, icon }) => (
  <View className="flex-1 px-1.5">
    <View className="bg-amber-50 border border-amber-100 rounded-xl p-3 items-center">
      <Text className="text-2xl">{icon}</Text>
      <Text className="text-2xl font-extrabold text-slate-900 mt-1">{value}</Text>
      <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-0.5 text-center">
        {label}
      </Text>
    </View>
  </View>
);
