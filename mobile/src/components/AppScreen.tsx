import React from 'react';
import { ScrollView, View, RefreshControl, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface AppScreenProps extends ScrollViewProps {
  /** Pass-through to RefreshControl. When omitted, no pull-to-refresh. */
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  scroll?: boolean;
}

/**
 * Standard mobile screen wrapper. Handles safe-area + status bar +
 * optional pull-to-refresh. Use this on every screen so the app's
 * top/bottom inset behaviour is consistent.
 */
export const AppScreen: React.FC<React.PropsWithChildren<AppScreenProps>> = ({
  children,
  onRefresh,
  refreshing = false,
  scroll = true,
  ...rest
}) => {
  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']} style={{ backgroundColor: '#F4F6F9' }}>
      <StatusBar style="dark" />
      {scroll ? (
        <ScrollView
          className="flex-1"
          // Bottom inset accounts for the floating pill tab bar (16 + 68 + 16).
          contentContainerStyle={{ paddingBottom: 110 }}
          refreshControl={
            onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
          }
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1">{children}</View>
      )}
    </SafeAreaView>
  );
};
