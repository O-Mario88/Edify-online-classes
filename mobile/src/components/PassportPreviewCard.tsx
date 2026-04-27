import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from './AppCard';
import { shareItem } from '@/hooks/useShare';
import type { PassportSummary } from '@/api/parent.api';
import { colors } from '@/theme';

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

      {total > 0 && (
        <Pressable
          onPress={() =>
            shareItem({
              title: `${childFirstName}'s Learning Passport`,
              message: `${childFirstName} has earned ${passport.badges} badge(s), ${passport.certificates} certificate(s), and had ${passport.projects_reviewed} project(s) reviewed at Maple Online School.`,
              url: 'https://maple.edify/passport',
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Share Learning Passport via WhatsApp"
          className="mt-4 py-2.5 rounded-full flex-row items-center justify-center"
          style={{ backgroundColor: colors.partner.whatsapp }}
        >
          <Ionicons name="logo-whatsapp" size={16} color={colors.text.onBrand} />
          <Text className="text-xs font-bold text-white ml-2">Share Passport</Text>
        </Pressable>
      )}
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
