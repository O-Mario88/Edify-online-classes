import React from 'react';
import { View, Text } from 'react-native';
import { colors, fontSize, fontWeight } from '@/theme';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
}

/**
 * Use anywhere a list might be empty. Honest tone — never says
 * "Loading…" when the list is genuinely empty, and never invents
 * sample data.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon }) => (
  <View className="items-center justify-center py-10 px-6">
    {icon && <View className="mb-3">{icon}</View>}
    <Text
      className="text-center"
      style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.body }}
    >
      {title}
    </Text>
    {message && (
      <Text
        className="text-center mt-1.5"
        style={{ fontSize: fontSize.sm, color: colors.text.muted, lineHeight: fontSize.sm * 1.45 }}
      >
        {message}
      </Text>
    )}
  </View>
);
