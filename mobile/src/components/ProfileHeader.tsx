import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCountry } from '@/hooks/useCountry';
import { useState } from 'react';
import { CountryPickerSheet } from './CountryPickerSheet';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

interface ProfileHeaderProps {
  /** Top-bar mode only — the bold greeting block is rendered separately. */
  name: string;
  unreadCount?: number;
  onNotificationsPress?: () => void;
  /** Render a tappable country pill in the centre of the bar (default true). */
  showCountry?: boolean;
}

/**
 * Top bar — three-column layout matching the reference:
 *   [ avatar disc ]  [ country pill ]  [ bell button ]
 *
 * This replaces the previous greeting-on-the-left ProfileHeader.
 * The bold "Welcome back, Grace 👋" greeting now lives in a separate
 * `<HomeHero>` block on each role home so headers can be reused on
 * non-home screens without duplicating the greeting.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  unreadCount = 0,
  onNotificationsPress,
  showCountry = true,
}) => {
  const { config } = useCountry();
  const [pickerOpen, setPickerOpen] = useState(false);
  const initials = (name || '?')
    .split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
        {/* Avatar */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface.raised,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.xs,
          }}
        >
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.body }}>
            {initials}
          </Text>
        </View>

        {/* Country pill — centered */}
        {showCountry && (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Pressable
              onPress={() => setPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`${config.name}, tap to change`}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: radius.pill,
                  backgroundColor: colors.surface.raised,
                  opacity: pressed ? 0.85 : 1,
                  ...shadows.xs,
                },
              ]}
            >
              <Text style={{ fontSize: 14, marginRight: 6 }}>{config.flag}</Text>
              <Text style={{ fontSize: fontSize.xs + 1, fontWeight: fontWeight.semibold as any, color: colors.text.primary }}>
                {config.name}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.text.soft} style={{ marginLeft: 4 }} />
            </Pressable>
          </View>
        )}
        {!showCountry && <View style={{ flex: 1 }} />}

        {/* Bell */}
        <Pressable
          onPress={onNotificationsPress}
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? `Notifications (${unreadCount} new)` : 'Notifications'}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface.raised,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.xs,
          }}
        >
          <Ionicons name="notifications-outline" size={20} color={palette.slate[700]} />
          {unreadCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                paddingHorizontal: 5,
                backgroundColor: palette.rose[700],
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.surface.canvas,
              }}
            >
              <Text style={{ color: colors.text.onBrand, fontSize: 9, fontWeight: fontWeight.bold as any }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
      <CountryPickerSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
};

interface HomeHeroProps {
  /** First line — eyebrow ("Welcome back,") */
  eyebrow?: string;
  /** Second line — bold name + optional emoji ("Grace 👋") */
  name: string;
  /** Optional emoji rendered after the name. */
  emoji?: string;
  /** Optional sub-line under the bold name. */
  subtitle?: string;
}

/**
 * Bold two-line hero greeting beneath the top bar. Matches the
 * "Health solution / made simple" pattern from the reference but uses
 * the user's name and a warm welcome eyebrow above.
 */
export const HomeHero: React.FC<HomeHeroProps> = ({ eyebrow = 'Welcome back,', name, emoji, subtitle }) => (
  <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
    {!!eyebrow && (
      <Text style={{ fontSize: fontSize.sm, color: colors.text.muted, fontWeight: fontWeight.medium as any }}>
        {eyebrow}
      </Text>
    )}
    <Text
      style={{
        fontSize: fontSize['3xl'],
        fontWeight: fontWeight.extrabold as any,
        color: colors.text.primary,
        letterSpacing: -0.6,
        lineHeight: fontSize['3xl'] * 1.1,
        marginTop: 2,
      }}
    >
      {name} {emoji ? <Text>{emoji}</Text> : null}
    </Text>
    {!!subtitle && (
      <Text style={{ fontSize: fontSize.sm, color: colors.text.muted, marginTop: 6 }}>
        {subtitle}
      </Text>
    )}
  </View>
);
