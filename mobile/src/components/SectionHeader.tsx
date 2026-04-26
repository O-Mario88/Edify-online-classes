import React from 'react';
import { View, Text, Pressable } from 'react-native';

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
      <Text className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</Text>
      {!!description && <Text className="text-xs text-slate-500 mt-0.5">{description}</Text>}
    </View>
    {actionLabel && onActionPress && (
      <Pressable onPress={onActionPress} accessibilityRole="link">
        <Text className="text-sm font-semibold text-maple-900">{actionLabel} →</Text>
      </Pressable>
    )}
  </View>
);
