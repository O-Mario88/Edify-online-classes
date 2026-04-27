import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { PaymentsSurface } from '@/components/PaymentsSurface';
import { PARENT_PLAN_KEYS } from '@/config/plans';

export default function ParentPayScreen() {
  const router = useRouter();
  return (
    <AppScreen>
      <View className="px-5 pt-6">
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
      </View>
      <PaymentsSurface
        planKeys={PARENT_PLAN_KEYS}
        eyebrow="Plans"
        title="Plan & payments"
        subtitle="Pick a parent plan, top up your child's subscription, and track receipts."
      />
    </AppScreen>
  );
}
