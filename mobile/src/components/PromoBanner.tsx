import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Polygon, Circle, G } from 'react-native-svg';
import { SERIF_FONT } from './LessonCover';
import { colors, palette, shadows } from '@/theme';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  onPress?: () => void;
}

/**
 * Premium hero banner used at the top of the Library / Learn surface.
 * Navy gradient with a bronze halo ribbon and an inline graduation-cap
 * illustration (echoes the Maple brand mark without re-rendering the
 * whole logo). The CTA pill uses the brand bronze so it feels premium
 * rather than utility.
 */
export const PromoBanner: React.FC<Props> = ({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  onPress,
}) => (
  <View
    style={{
      borderRadius: 24,
      overflow: 'hidden',
      height: 168,
      ...shadows.lg,
    }}
  >
    <Svg style={StyleSheet.absoluteFillObject} viewBox="0 0 320 168" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="promo-grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#1E3A5F" />
          <Stop offset="1" stopColor="#0F2A45" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#promo-grad)" />
      {/* Bronze halo ribbon */}
      <Polygon points="220,0 320,0 320,80 200,30" fill="#E8C9A4" opacity={0.25} />
      <Polygon points="280,140 320,168 250,168" fill="#E8C9A4" opacity={0.18} />
      {/* Stylised graduation cap, right-of-centre */}
      <G transform="translate(228, 50)">
        <Polygon points="36,4 70,18 36,32 2,18" fill="#E8C9A4" />
        <Polygon points="14,20 58,20 36,30" fill="#0F2A45" opacity={0.25} />
        <Polygon points="68,18 70,30 70,42 65,42 65,30" fill="#E8C9A4" />
        <Circle cx="68" cy="46" r="3" fill="#E8C9A4" />
      </G>
    </Svg>

    <View style={{ flex: 1, padding: 18, justifyContent: 'space-between' }}>
      <View style={{ width: '70%' }}>
        {!!eyebrow && (
          <Text
            style={{
              color: colors.brand.accent,
              fontSize: 10,
              fontWeight: '800',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </Text>
        )}
        <Text
          numberOfLines={2}
          style={{
            color: colors.text.onBrand,
            fontFamily: SERIF_FONT,
            fontSize: 20,
            fontWeight: '800',
            lineHeight: 26,
            marginTop: 6,
          }}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            numberOfLines={2}
            style={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: 12,
              lineHeight: 18,
              marginTop: 6,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        style={{
          alignSelf: 'flex-start',
          backgroundColor: colors.brand.accent,
          borderRadius: 999,
          paddingHorizontal: 18,
          paddingVertical: 9,
        }}
      >
        <Text style={{ color: colors.brand.primary, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }}>
          {ctaLabel}
        </Text>
      </Pressable>
    </View>
  </View>
);
