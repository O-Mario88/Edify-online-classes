import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { useAuthStore } from '@/auth/authStore';
import { logout } from '@/auth/AuthProvider';
import { ReplayTourCard } from '@/components/ReplayTourCard';

/**
 * Teacher profile + settings. Light surface for now — teacher profile
 * data, links to deep features, and a sign-out button. Real settings
 * (teaching subjects, languages, bio) land alongside the Storefront
 * editor.
 */
export default function TeacherProfileTab() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fullName = user?.full_name || 'Teacher';
  const initials = fullName.split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  const onSignOut = async () => {
    await logout();
    router.replace('/(auth)/welcome' as any);
  };

  return (
    <AppScreen>
      <View className="px-5 pt-8 items-center">
        <View
          className="w-20 h-20 rounded-full bg-white items-center justify-center mb-3"
          style={{
            elevation: 1,
            shadowColor: '#0F172A',
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-2xl font-extrabold text-slate-800">{initials || '?'}</Text>
        </View>
        <Text className="text-xl font-extrabold text-slate-900">{fullName}</Text>
        <Text className="text-xs text-slate-500 mt-1">{user?.email || ''}</Text>
      </View>

      <View className="px-5 mt-7">
        <Pressable
          onPress={() => router.push('/(teacher)/upgrade' as any)}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Teacher Pro"
          className="rounded-3xl p-4 flex-row items-center mb-5"
          style={{
            backgroundColor: '#0F2A45',
            elevation: 2,
            shadowColor: '#0F172A',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <View className="w-11 h-11 rounded-2xl bg-white/10 items-center justify-center mr-3">
            <Ionicons name="sparkles-outline" size={22} color="#E8C9A4" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Upgrade</Text>
            <Text className="text-sm font-extrabold text-white mt-0.5">Open your Teacher Pro storefront</Text>
            <Text className="text-[11px] text-slate-300 mt-0.5">Paid live classes, project review earnings, and a verified badge.</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#E8C9A4" />
        </Pressable>

        <View style={{ marginBottom: 12 }}>
          <ReplayTourCard role="teacher" />
        </View>

        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Settings</Text>
        <Row icon="storefront-outline"  label="Storefront"      onPress={() => router.push('/(teacher)/storefront' as any)} />
        <Row icon="radio-outline"       label="Standby & office hours" onPress={() => router.push('/(teacher)/availability' as any)} />
        <Row icon="notifications-outline" label="Notifications"  onPress={() => router.push('/(teacher)/notifications' as any)} />
        <Row icon="cash-outline"         label="Earnings & payouts" onPress={() => router.push('/(teacher)/earnings' as any)} />
      </View>

      <View className="px-5 mt-7 mb-4">
        <Pressable
          onPress={onSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          className="py-3 rounded-2xl bg-rose-50 border border-rose-200 items-center"
        >
          <Text className="text-sm font-bold text-rose-700">Sign out</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const Row: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
    style={{
      elevation: 1,
      shadowColor: '#0F172A',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    }}
  >
    <View className="w-9 h-9 rounded-2xl bg-slate-100 items-center justify-center mr-3">
      <Ionicons name={icon} size={18} color="#334155" />
    </View>
    <Text className="flex-1 text-sm font-bold text-slate-900">{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
  </Pressable>
);
