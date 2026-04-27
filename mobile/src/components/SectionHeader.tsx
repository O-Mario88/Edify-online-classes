import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '@/theme';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

/**
 * Standard section header. Title + optional description + optional
 * "See all" affordance — used to bookend each list on the home / tabs.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, actionLabel, onActionPress }) => (
  <View className="flex-row items-end justify-between mb-3">
    <View className="flex-1 pr-3">
      <Text className="text-lg font-extrabold tracking-tight" style={{ color: colors.text.primary }}>{title}</Text>
      {!!description && <Text className="text-xs mt-0.5" style={{ color: colors.text.muted }}>{description}</Text>}
    </View>
    {actionLabel && onActionPress && (
      <Pressable onPress={onActionPress} accessibilityRole="link">
        <Text className="text-sm font-semibold" style={{ color: colors.brand.primary }}>{actionLabel} →</Text>
      </Pressable>
    )}
  </View>
);
