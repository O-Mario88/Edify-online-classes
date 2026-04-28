import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BrandBackground } from './BrandBackground';
import { useAuth } from '@/auth/useAuth';
import { logout } from '@/auth/AuthProvider';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';
import type { LockReason } from '@/api/access.api';

interface Props {
  lockReason: LockReason;
  /** Days remaining as of the last grant — used in the "expired" copy. */
  daysSinceExpired?: number;
  /** Pending upgrade-request payload, when the user has one in flight. */
  pendingPlan?: string | null;
  /** Optional label for the destination this paywall blocks ("class syllabus", "live class") */
  blockedSurface?: string;
}

/**
 * Full-screen paywall takeover. Renders when the access hook reports
 * has_active_access === false. The copy adapts to the lock_reason so
 * the user sees the right next step:
 *
 *   - no_subscription: "Subscribe to unlock the full platform"
 *   - expired:         "Your access expired — renew to keep going"
 *   - pending_approval: "Awaiting admin approval — usually within 24h"
 *
 * Primary CTA always routes to the role's payment / upgrade screen.
 * Secondary action is logout, since locked users may want to switch
 * accounts (e.g. parent paying on behalf of a learner).
 */
export const PaywallScreen: React.FC<Props> = ({
  lockReason,
  pendingPlan,
  blockedSurface = 'this part of Maple',
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();

  const upgradeHref =
    role.includes('teacher')     ? '/(teacher)/upgrade'
    : role.includes('institution') ? '/(institution)/upgrade'
    : role === 'parent'            ? '/(parent)/pay'
    : '/(student)/payment';

  const copy = COPY[lockReason || 'no_subscription'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.canvas }}>
      <BrandBackground haloY={0.18} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: palette.bronze[100],
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                ...shadows.sm,
              }}
            >
              <Ionicons name={copy.icon} size={28} color={palette.bronze[800]} />
            </View>

            <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.body}>{copy.body.replace('{surface}', blockedSurface)}</Text>

            {/* Pending request callout */}
            {pendingPlan && (
              <View style={styles.pendingCard}>
                <Ionicons name="hourglass-outline" size={20} color={palette.amber[800]} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.pendingTitle}>Request submitted — {pendingPlan.replace('_', ' ')}</Text>
                  <Text style={styles.pendingBody}>
                    A Maple admin will reach out on your phone within 24 hours to confirm payment.
                  </Text>
                </View>
              </View>
            )}

            {/* Value list */}
            <View style={styles.valueList}>
              <Text style={styles.valueListEyebrow}>WHAT YOU UNLOCK</Text>
              {VALUE_PROPS.map((v) => (
                <View key={v.label} style={styles.valueRow}>
                  <Ionicons name="checkmark-circle" size={18} color={palette.emerald[700]} />
                  <Text style={styles.valueLabel}>{v.label}</Text>
                </View>
              ))}
            </View>

            {/* Primary CTA */}
            <Pressable
              onPress={() => router.push(upgradeHref as any)}
              accessibilityRole="button"
              accessibilityLabel={copy.cta}
              style={({ pressed }) => [styles.primaryCta, { opacity: pressed ? 0.92 : 1 }]}
            >
              <Text style={styles.primaryCtaLabel}>{copy.cta}</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.text.onBrand} style={{ marginLeft: 8 }} />
            </Pressable>

            {/* Logout */}
            <Pressable
              onPress={async () => {
                await logout();
                router.replace('/(auth)/welcome');
              }}
              style={{ marginTop: 18, alignSelf: 'center' }}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <Text style={styles.logoutLabel}>Sign out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const COPY: Record<NonNullable<LockReason>, { eyebrow: string; title: string; body: string; cta: string; icon: keyof typeof Ionicons.glyphMap }> = {
  no_subscription: {
    eyebrow: 'PLATFORM ACCESS',
    title: 'Pay your platform fee to unlock',
    body: "The Maple homepage is free. To open {surface}, register your child and pay the platform fee. Real teachers, full curriculum, exam prep, and the Learning Passport are all included.",
    cta: 'Pay platform fee',
    icon: 'lock-closed-outline',
  },
  expired: {
    eyebrow: 'PLATFORM ACCESS',
    title: 'Your access has expired',
    body: "Renew the platform fee to re-open {surface}. Your progress, badges, and Learning Passport are kept safely while you're away.",
    cta: 'Renew platform fee',
    icon: 'time-outline',
  },
  pending_approval: {
    eyebrow: 'ALMOST THERE',
    title: 'Awaiting payment confirmation',
    body: "Your upgrade request is in. A Maple admin will confirm the platform fee on your phone within 24 hours. {surface} unlocks the moment payment lands.",
    cta: 'See payment status',
    icon: 'hourglass-outline',
  },
};

const VALUE_PROPS = [
  { label: 'Live classes with real teachers' },
  { label: 'Full curriculum lessons + practice labs' },
  { label: 'Mock exams + mistake notebook' },
  { label: 'AI Study Buddy — hints, never answers' },
  { label: 'Verified Learning Passport' },
];

const styles = {
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold as any,
    letterSpacing: 1.6,
    color: palette.bronze[700],
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold as any,
    color: colors.text.primary,
    letterSpacing: -0.4,
    lineHeight: fontSize['2xl'] * 1.18,
  },
  body: {
    marginTop: 12,
    fontSize: fontSize.base,
    color: colors.text.body,
    lineHeight: fontSize.base * 1.55,
  },
  pendingCard: {
    marginTop: 20,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: palette.amber[50],
    borderWidth: 1,
    borderColor: palette.amber[100],
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },
  pendingTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold as any,
    color: palette.amber[900],
  },
  pendingBody: {
    fontSize: fontSize.xs,
    color: palette.amber[800],
    marginTop: 4,
    lineHeight: fontSize.xs * 1.5,
  },
  valueList: {
    marginTop: 24,
    backgroundColor: colors.surface.raised,
    borderRadius: radius.cardLg,
    padding: 18,
    ...shadows.xs,
  },
  valueListEyebrow: {
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.bold as any,
    letterSpacing: 1.2,
    color: colors.text.muted,
    marginBottom: 10,
  },
  valueRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  valueLabel: {
    fontSize: fontSize.sm,
    color: colors.text.body,
    marginLeft: 10,
  },
  primaryCta: {
    marginTop: 24,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 14,
    borderRadius: radius.cardLg,
    backgroundColor: colors.brand.primary,
    ...shadows.md,
  },
  primaryCtaLabel: {
    color: colors.text.onBrand,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold as any,
    letterSpacing: 0.2,
  },
  logoutLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as any,
    color: colors.text.muted,
  },
} as const;
