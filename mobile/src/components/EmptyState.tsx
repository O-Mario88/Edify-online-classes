import React from 'react';
import { View, Text } from 'react-native';

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
    <Text className="text-base font-bold text-slate-700 text-center">{title}</Text>
    {message && <Text className="text-sm text-slate-500 text-center mt-1.5">{message}</Text>}
  </View>
);
