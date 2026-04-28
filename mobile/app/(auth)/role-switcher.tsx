import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthScreen } from '@/components/AuthScreen';
import { AnimatedMapleLogo } from '@/components/AnimatedMapleLogo';
import { useAuthStore } from '@/auth/authStore';
import { homeRouteForRole } from '@/auth/roleRouting';

interface RoleOption {
  key: 'student' | 'parent' | 'teacher' | 'institution';
  label: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  tintBg: string;
  tintFg: string;
}

const ROLES: RoleOption[] = [
  { key: 'student',     label: 'Student',     body: 'Daily plan, lessons, live classes, and the Passport.',     icon: 'school-outline',     tintBg: '#E0E7FF', tintFg: '#3730A3' },
  { key: 'parent',      label: 'Parent',      body: 'Weekly briefs, exam readiness, and reports per child.',    icon: 'people-outline',     tintBg: '#FFE4E6', tintFg: '#9F1239' },
  { key: 'teacher',     label: 'Teacher',     body: 'Today\'s classes, review queue, and student questions.',    icon: 'book-outline',       tintBg: '#D1FAE5', tintFg: '#065F46' },
  { key: 'institution', label: 'Institution', body: 'School health, attendance, and admission inbox.',          icon: 'business-outline',   tintBg: '#FEF3C7', tintFg: '#92400E' },
];

/**
 * Role switcher — shown after login when the user has multiple roles
 * on their account, and reachable from Profile so users can switch
 * later. Today the JWT carries a single role per session; this screen
 * surfaces the chosen role and lets the user route into it. When the
 * backend lands a multi-role response, the same UI lights up.
 */
export default function RoleSwitcher() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currentRole = (user?.role || 'student').toLowerCase();
  const [pending, setPending] = useState<string | null>(null);

  const onPick = (role: string) => {
    setPending(role);
    // Today the role is fixed by the JWT — only the current role
    // routes to its home. Other roles surface a "you don't have access
    // yet" hint until multi-role lands server-side.
    if (role === currentRole) {
      router.replace(homeRouteForRole(role) as any);
      return;
    }
    setTimeout(() => setPending(null), 600);
  };

  return (
    <AuthScreen haloY={0.18}>
      <View className="px-6 pt-6 pb-10 items-center">
        <Pressable onPress={() => router.back()} className="self-start mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>

        <View className="items-center mt-2 mb-6">
          <AnimatedMapleLogo size={140} />
        </View>

        <Text className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
          Pick your view
        </Text>
        <Text className="text-sm text-slate-600 mt-2 text-center px-4 leading-relaxed">
          Maple shapes itself around the role you're using right now.
        </Text>

        <View className="w-full mt-7" style={{ gap: 12 }}>
          {ROLES.map((r) => {
            const active = r.key === currentRole;
            const showPending = pending === r.key && !active;
            return (
              <Pressable
                key={r.key}
                onPress={() => onPick(r.key)}
                accessibilityRole="button"
                accessibilityLabel={r.label}
                className="bg-white rounded-3xl p-4 flex-row items-center"
                style={{
                  elevation: 1,
                  shadowColor: '#0F172A',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  borderWidth: active ? 2 : 0,
                  borderColor: active ? '#0F2A45' : 'transparent',
                }}
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                  style={{ backgroundColor: r.tintBg }}
                >
                  <Ionicons name={r.icon} size={22} color={r.tintFg} />
                </View>
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center">
                    <Text className="text-base font-extrabold text-slate-900">{r.label}</Text>
                    {active && (
                      <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#0F2A45' }}>
                        <Text className="text-[10px] font-bold text-white">CURRENT</Text>
                      </View>
                    )}
                    {showPending && (
                      <Text className="ml-2 text-[10px] font-bold text-amber-700">Ask your school</Text>
                    )}
                  </View>
                  <Text className="text-xs text-slate-500 mt-0.5">{r.body}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </Pressable>
            );
          })}
        </View>
      </View>
    </AuthScreen>
  );
}
