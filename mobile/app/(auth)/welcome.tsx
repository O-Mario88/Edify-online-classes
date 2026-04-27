import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthScreen } from '@/components/AuthScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AnimatedMapleLogo } from '@/components/AnimatedMapleLogo';
import { CountryChip } from '@/components/CountryChip';
import { CountryPickerSheet } from '@/components/CountryPickerSheet';
import { useCountry } from '@/hooks/useCountry';

/**
 * Pre-login splash. The brand artwork carries the wordmark + tagline,
 * so the screen is intentionally quiet: a softly breathing hero logo
 * floating above a warm gradient, two CTAs and a legal footer pinned
 * to the bottom.
 *
 * The country chip in the top-right opens a picker so a Kenyan user
 * lands on Maple with KES + KCSE / KCPE labels rather than the
 * Ugandan defaults.
 */
export default function Welcome() {
  const router = useRouter();
  const { config } = useCountry();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <AuthScreen scroll={false} haloY={0.42}>
      <View className="flex-1 px-6 pb-10 pt-6">
        <View className="flex-row items-start justify-end">
          <CountryChip onPress={() => setPickerOpen(true)} />
        </View>

        <View className="flex-1 items-center justify-center">
          <AnimatedMapleLogo size={300} intensity="hero" />
        </View>

        <View className="w-full">
          <PrimaryButton label="Sign in" onPress={() => router.push('/(auth)/login')} />
          <View className="h-3" />
          <PrimaryButton
            label="Create an account"
            variant="secondary"
            onPress={() => router.push('/(auth)/signup')}
          />
          <Text className="text-xs text-slate-500 text-center mt-5 px-4 leading-relaxed">
            By continuing you agree to Maple's terms and privacy policy. {config.flag} {config.name} · {config.curriculum}.
          </Text>
        </View>
      </View>

      <CountryPickerSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </AuthScreen>
  );
}
