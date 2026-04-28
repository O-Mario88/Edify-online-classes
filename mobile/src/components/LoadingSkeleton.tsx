import React from 'react';
import { View } from 'react-native';

/**
 * Cheap skeleton — solid grey blocks. Skip animation libraries until
 * we measure that users notice. Uniform height so screens don't shift
 * when real content lands.
 */
export const LoadingSkeleton: React.FC<{ height?: number; lines?: number }> = ({
  height = 90,
  lines = 1,
}) => (
  <View className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <View
        key={i}
        className="bg-slate-200 rounded-2xl"
        style={{ height }}
      />
    ))}
  </View>
);
