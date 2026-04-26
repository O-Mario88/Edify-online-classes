import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MapleLogo } from './MapleLogo';

/**
 * Branded launch screen. Sits in front of the user during the brief
 * boot path (refresh-token check + first-paint hydration) so the app
 * never shows a blank slate. The wordmark + tagline are baked into the
 * logo artwork, so we don't render any extra text here.
 */
export const LaunchScreen: React.FC = () => (
  <SafeAreaView style={styles.root}>
    <StatusBar style="dark" />
    <View style={styles.center}>
      <MapleLogo size={260} />
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
