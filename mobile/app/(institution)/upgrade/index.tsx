import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { PaymentsSurface } from '@/components/PaymentsSurface';
import { INSTITUTION_PLAN_KEYS } from '@/config/plans';

export default function InstitutionUpgradeScreen() {
  const router = useRouter();
  return (
    <AppScreen>
      <View className="px-5 pt-6">
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
      </View>
      <PaymentsSurface
        planKeys={INSTITUTION_PLAN_KEYS}
        eyebrow="Institution plans"
        title="School OS plans"
        subtitle="Pick a plan that matches the rollout you have in mind. We onboard each pilot school personally."
      />
    </AppScreen>
  );
}
