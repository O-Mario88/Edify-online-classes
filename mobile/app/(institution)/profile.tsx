import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { useAuthStore } from '@/auth/authStore';
import { logout } from '@/auth/AuthProvider';
import { ReplayTourCard } from '@/components/ReplayTourCard';

/**
 * Institution profile + settings. Light surface — admin profile data,
 * shortcuts to feature screens, and sign out. Branded settings (logo,
 * colours, school details) land in a future Phase.
 */
export default function InstitutionProfileTab() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fullName = user?.full_name || 'Admin';
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
        <View style={{ marginBottom: 12 }}>
          <ReplayTourCard role="institution_admin" />
        </View>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Operations</Text>
        <Row icon="alert-circle-outline"   label="Risk alerts"        onPress={() => router.push('/(institution)/risk' as any)} />
        <Row icon="people-outline"         label="Teacher delivery"   onPress={() => router.push('/(institution)/teacher-delivery' as any)} />
        <Row icon="chatbubbles-outline"    label="Parent engagement"  onPress={() => router.push('/(institution)/parent-engagement' as any)} />
        <Row icon="file-tray-stacked-outline" label="Application review" onPress={() => router.push('/(institution)/application-review' as any)} />
        <Row icon="notifications-outline"  label="Notifications"      onPress={() => router.push('/(institution)/notifications' as any)} />
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
