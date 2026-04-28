import React from 'react';
import { View, Text, Pressable, Linking, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BrandBackground } from './BrandBackground';
import { MapleLogo } from './MapleLogo';
import { colors, palette, fontSize, fontWeight, letterSpacing, radius, shadows } from '@/theme';

interface Props {
  variant: 'force_update' | 'maintenance';
  /** From AppConfig — used to deep-link the store / show contact email. */
  supportEmail?: string;
  latestVersion?: string;
}

const STORE_URLS = {
  ios: 'https://apps.apple.com/app/maple-online-school/id000000000',
  android: 'https://play.google.com/store/apps/details?id=school.maple',
};

/**
 * Pre-auth gate screen rendered when /mobile/app-config/ tells us the
 * client must update or that the platform is in maintenance mode. The
 * user can't proceed past this screen — the only available actions
 * are "Update" (force_update) or "Email support" (maintenance).
 */
export const AppGateScreen: React.FC<Props> = ({ variant, supportEmail, latestVersion }) => {
  const onUpdate = () => {
    const url = Platform.OS === 'ios' ? STORE_URLS.ios : STORE_URLS.android;
    Linking.openURL(url).catch(() => {});
  };
  const onEmailSupport = () => {
    if (!supportEmail) return;
    Linking.openURL(`mailto:${supportEmail}`).catch(() => {});
  };

  const headline = variant === 'force_update' ? 'Time to update' : 'Maple is offline for maintenance';
  const body =
    variant === 'force_update'
      ? `Maple Online School ${latestVersion ? `v${latestVersion} ` : ''}is ready in your app store. Updating brings the latest lessons, fixes, and tools.`
      : 'We\'re briefly offline to ship some improvements. Lessons, classes, and Passport entries are safe — we\'ll be back shortly.';
  const ctaLabel = variant === 'force_update' ? 'Update Maple' : 'Refresh';

  return (
    <View style={styles.root}>
      <BrandBackground haloY={0.35} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <MapleLogo size={180} />
          <View style={styles.iconWrap}>
            <Ionicons
              name={variant === 'force_update' ? 'cloud-download-outline' : 'construct-outline'}
              size={26}
              color={colors.brand.primary}
            />
          </View>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.body}>{body}</Text>

          <Pressable
            onPress={variant === 'force_update' ? onUpdate : () => {}}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            style={[styles.cta, { backgroundColor: colors.brand.primary }]}
          >
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </Pressable>

          {variant === 'maintenance' && supportEmail && (
            <Pressable onPress={onEmailSupport} style={styles.linkRow}>
              <Text style={styles.linkText}>Need help? Email {supportEmail}</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: {
    marginTop: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface.raised,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headline: {
    marginTop: 18,
    fontSize: fontSize['2xl'] - 2,
    fontWeight: fontWeight.extrabold as any,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: letterSpacing.tightHead * 0.6,
  },
  body: {
    marginTop: 10,
    fontSize: fontSize.sm + 1,
    lineHeight: 22,
    color: colors.text.body,
    textAlign: 'center',
    maxWidth: 320,
  },
  cta: {
    marginTop: 32,
    borderRadius: radius.pill,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  ctaText: {
    color: colors.text.onBrand,
    fontSize: fontSize.sm + 1,
    fontWeight: fontWeight.extrabold as any,
    letterSpacing: letterSpacing.ui,
  },
  linkRow: { marginTop: 18 },
  linkText: {
    fontSize: fontSize.xs + 1,
    fontWeight: fontWeight.semibold as any,
    color: palette.slate[500],
  },
});
