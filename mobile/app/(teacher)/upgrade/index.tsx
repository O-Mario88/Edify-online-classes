import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { PaymentsSurface } from '@/components/PaymentsSurface';
import { TEACHER_PLAN_KEYS } from '@/config/plans';

export default function TeacherUpgradeScreen() {
  const router = useRouter();
  return (
    <AppScreen>
      <View className="px-5 pt-6">
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
      </View>
      <PaymentsSurface
        planKeys={TEACHER_PLAN_KEYS}
        eyebrow="Teacher plans"
        title="Upgrade to Teacher Pro"
        subtitle="Open your storefront, run paid live classes, and unlock the earnings dashboard."
      />
    </AppScreen>
  );
}
