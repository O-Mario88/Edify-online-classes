import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuthStore } from '@/auth/authStore';
import { logout } from '@/auth/AuthProvider';

/**
 * Profile tab — minimal Phase 2 surface. Shows the signed-in user's
 * name + role + stage + access tier, plus sign-out and a help link.
 *
 * Phase 6 (monetisation) will expand this into plan management +
 * receipts; Phase 7 adds notification preferences. For now, the bare
 * essentials so the user can recognise themselves and sign out.
 */
export default function ProfileTab() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const initials = (user?.full_name || user?.email || '?')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const stageLabel = user?.stage === 'primary' ? 'Primary (P4–P7)' : user?.stage === 'secondary' ? 'Secondary (S1–S6)' : null;

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
                {user?.full_name || 'Maple learner'}
              </Text>
              <Text numberOfLines={1} className="text-xs text-slate-500 mt-0.5">{user?.email}</Text>
              {stageLabel && (
                <Text className="text-[11px] font-semibold text-maple-900 mt-1">{stageLabel}</Text>
              )}
            </View>
          </View>
        </AppCard>

        <AppCard>
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">App</Text>
          <Row label="Help & Support" onPress={() => {}} />
          <Row label="Privacy" onPress={() => {}} />
          <Row label="Terms of service" onPress={() => {}} />
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
