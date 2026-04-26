import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuthStore } from '@/auth/authStore';
import { logout } from '@/auth/AuthProvider';

/**
 * Parent Profile tab — same shape as the student version. Shows
 * avatar / name / email + the "App" row group + Sign out.
 *
 * Phase 6 (monetisation) replaces the App row group with plan
 * management + receipts + payment history.
 */
export default function ParentProfile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const initials = (user?.full_name || user?.email || '?')
    .split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <AppScreen>
      <View className="px-5 pt-6 pb-4">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Account</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Profile</Text>
      </View>

      <View className="px-5 space-y-4">
        <AppCard>
          <View className="flex-row items-center gap-4">
            <View className="w-14 h-14 rounded-full bg-maple-900 items-center justify-center">
              <Text className="text-white text-lg font-extrabold">{initials}</Text>
            </View>
            <View className="flex-1 min-w-0">
              <Text numberOfLines={1} className="text-base font-bold text-slate-900">
                {user?.full_name || 'Maple parent'}
              </Text>
              <Text numberOfLines={1} className="text-xs text-slate-500 mt-0.5">{user?.email}</Text>
              <Text className="text-[11px] font-semibold text-maple-900 mt-1">Parent</Text>
            </View>
          </View>
        </AppCard>

        <AppCard>
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">App</Text>
          <Row label="Help & Support" />
          <Row label="Privacy" />
          <Row label="Terms of service" />
          <Row label="App version" trailing="0.1.0" />
        </AppCard>

        <View className="mt-2">
          <PrimaryButton
            label="Sign out"
            variant="secondary"
            onPress={async () => {
              await logout();
              router.replace('/(auth)/welcome');
            }}
          />
        </View>
      </View>
    </AppScreen>
  );
}

const Row: React.FC<{ label: string; onPress?: () => void; trailing?: string }> = ({ label, onPress, trailing }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    className="flex-row items-center justify-between py-3 border-b border-slate-100 last:border-b-0"
  >
    <Text className="text-sm font-medium text-slate-800">{label}</Text>
    {trailing ? (
      <Text className="text-xs text-slate-500">{trailing}</Text>
    ) : (
      <Text className="text-slate-400 text-base">›</Text>
    )}
  </Pressable>
);
