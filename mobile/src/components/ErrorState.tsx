import React from 'react';
import { View, Text } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { colors, fontSize, fontWeight } from '@/theme';

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
    <Text
      className="text-center"
      style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.text.body }}
    >
      {title}
    </Text>
    <Text
      className="text-center mt-1.5"
      style={{ fontSize: fontSize.sm, color: colors.text.muted, lineHeight: fontSize.sm * 1.45 }}
    >
      {message}
    </Text>
    {onRetry && (
      <View className="mt-5 w-full max-w-xs">
        <PrimaryButton label="Try again" variant="secondary" onPress={onRetry} />
      </View>
    )}
  </View>
);
