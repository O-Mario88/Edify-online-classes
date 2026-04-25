import React from 'react';
import { View, Text } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "Pull to refresh or try again in a moment.",
  onRetry,
}) => (
  <View className="items-center justify-center py-10 px-6">
    <Text className="text-base font-bold text-slate-700 text-center">{title}</Text>
    <Text className="text-sm text-slate-500 text-center mt-1.5">{message}</Text>
    {onRetry && (
      <View className="mt-5 w-full max-w-xs">
        <PrimaryButton label="Try again" variant="secondary" onPress={onRetry} />
      </View>
    )}
  </View>
);
