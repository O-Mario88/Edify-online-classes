import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { MapleLogo } from '@/components/MapleLogo';

/**
 * Pre-login splash. Three short lines of positioning, two buttons.
 * Avoids the temptation to load illustrations or onboarding swipes —
 * those are post-pilot.
 */
export default function Welcome() {
  const router = useRouter();
  return (
    <AppScreen scroll={false}>
      <View className="flex-1 px-6 justify-between pb-8 pt-12">
        <View>
          <View className="mb-8">
            <MapleLogo size={96} />
          </View>
          <Text className="text-3xl font-extrabold text-slate-900 leading-tight">
            A complete online school in your pocket.
          </Text>
          <Text className="text-base text-slate-600 mt-3 leading-relaxed">
            Learn from real teachers, complete guided practice, take mock exams, and build a verified Learning Passport.
          </Text>
        </View>

        <View className="space-y-3">
          <PrimaryButton label="Sign in" onPress={() => router.push('/(auth)/login')} />
          <PrimaryButton
            label="Create an account"
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
          />
          <Text className="text-xs text-slate-500 text-center mt-2">
            By continuing you agree to Maple's terms and privacy policy.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}
