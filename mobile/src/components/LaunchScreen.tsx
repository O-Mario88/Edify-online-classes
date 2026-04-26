import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MapleLogo } from './MapleLogo';

/**
 * Branded launch screen. Sits in front of the user during the brief
 * boot path (refresh-token check + first-paint hydration) so the app
 * never shows a blank slate.
 *
 * The animated WiFi arcs in the logo double as the loading indicator
 * — we deliberately don't add a separate spinner; the brand mark
 * itself signals "we're working."
 */
export const LaunchScreen: React.FC<{ tagline?: string }> = ({
  tagline = 'Learn anywhere · Achieve everywhere',
}) => (
  <SafeAreaView style={styles.root}>
    <StatusBar style="dark" />
    <View style={styles.center}>
      <MapleLogo size={140} showWordmark animated />
      <Text style={styles.tagline}>{tagline}</Text>
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
  tagline: {
    marginTop: 28,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
