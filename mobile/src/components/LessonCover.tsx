import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import Svg, { Rect, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, palette } from '@/theme';

export const SERIF_FONT = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

interface Props {
  subject: string;
  title: string;
  /** sm: 56×80 (list rows); md: 96×136; lg: 140×196; xl: 200×280 (hero/detail). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Override the auto-detected subject palette. */
  paletteOverride?: { base: string; accent: string };
}

const SIZES = {
  sm: { w: 56,  h: 80,  pad: 6,  title: 9,  label: 6 },
  md: { w: 96,  h: 136, pad: 10, title: 14, label: 8 },
  lg: { w: 140, h: 196, pad: 12, title: 18, label: 9 },
  xl: { w: 200, h: 280, pad: 16, title: 24, label: 11 },
} as const;

interface Palette {
  base: string;
  accent: string;
  /** Corner-flag fill, kept light so it reads as paper. */
  flag: string;
}

const PALETTES: Record<string, Palette> = {
  default:   { base: palette.navy[900],    accent: palette.navy[800],    flag: palette.bronze[200] },
  maths:     { base: '#1E3A8A',            accent: palette.indigo[800],  flag: '#FCD34D' },
  math:      { base: '#1E3A8A',            accent: palette.indigo[800],  flag: '#FCD34D' },
  science:   { base: palette.emerald[800], accent: palette.emerald[700], flag: palette.emerald[100] },
  biology:   { base: palette.emerald[800], accent: palette.emerald[700], flag: palette.emerald[100] },
  chemistry: { base: '#0E7490',            accent: '#155E75',            flag: '#A5F3FC' },
  physics:   { base: '#1E40AF',            accent: '#1D4ED8',            flag: '#BFDBFE' },
  english:   { base: palette.rose[800],    accent: palette.rose[900],    flag: palette.rose[100] },
  literature:{ base: palette.rose[800],    accent: palette.rose[900],    flag: palette.rose[100] },
  history:   { base: palette.amber[800],   accent: palette.amber[900],   flag: palette.orange[100] },
  geography: { base: palette.teal[800],    accent: palette.teal[900],    flag: palette.teal[100] },
  art:       { base: palette.purple[800],  accent: palette.purple[900],  flag: palette.purple[100] },
  music:     { base: palette.orange[900],  accent: palette.orange[800],  flag: palette.orange[100] },
  ict:       { base: '#1F2937',            accent: '#111827',            flag: '#A5B4FC' },
  computing: { base: '#1F2937',            accent: '#111827',            flag: '#A5B4FC' },
  religion:  { base: '#7C3AED',            accent: palette.purple[700],  flag: '#E9D5FF' },
};

const paletteFor = (subject: string): Palette => {
  const key = (subject || '').toLowerCase().split(/\s|·|-/)[0];
  return PALETTES[key] || PALETTES.default;
};

const monogram = (subject: string): string => {
  const words = (subject || '?').split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (subject || '?').slice(0, 2).toUpperCase();
};

/**
 * Premium book-style cover. Solid subject-coloured base, a soft
 * diagonal gradient highlight for paper depth, a folded-paper "flag"
 * accent in the top-right (echoes the brand's launch artwork), and a
 * serif title block. Used in the Library list, Continue Learning hero,
 * and the lesson detail screen.
 *
 * Implementation: SVG handles the gradient + flag so the cover stays
 * sharp at any size and avoids RN's brittle gradient libs. Text sits
 * on top in regular RN <Text> for proper wrapping and accessibility.
 */
export const LessonCover: React.FC<Props> = ({
  subject,
  title,
  size = 'md',
  paletteOverride,
}) => {
  const dim = SIZES[size];
  const pal = paletteOverride ? { ...paletteFor(subject), ...paletteOverride } : paletteFor(subject);
  const titleSize = dim.title;
  const labelSize = dim.label;

  return (
    <View
      style={{
        width: dim.w,
        height: dim.h,
        borderRadius: size === 'sm' ? 6 : size === 'md' ? 8 : 12,
        overflow: 'hidden',
        elevation: size === 'sm' ? 1 : 3,
        shadowColor: palette.slate[900],
        shadowOpacity: 0.15,
        shadowRadius: size === 'sm' ? 4 : 10,
        shadowOffset: { width: 0, height: size === 'sm' ? 2 : 6 },
      }}
    >
      <Svg style={StyleSheet.absoluteFillObject} viewBox={`0 0 ${dim.w} ${dim.h}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="cover-grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={pal.accent} />
            <Stop offset="1" stopColor={pal.base} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#cover-grad)" />
        {/* Folded-paper flag, top-right. */}
        <Polygon
          points={`${dim.w - dim.w * 0.32},0 ${dim.w},0 ${dim.w},${dim.h * 0.22}`}
          fill={pal.flag}
          opacity={0.9}
        />
        {/* Subtle inner crease */}
        <Polygon
          points={`${dim.w - dim.w * 0.32},0 ${dim.w},0 ${dim.w - dim.w * 0.05},${dim.h * 0.05}`}
          fill="#FFFFFF"
          opacity={0.18}
        />
      </Svg>

      <View style={{ flex: 1, padding: dim.pad, justifyContent: 'space-between' }}>
        <Text
          style={{
            color: 'rgba(255,255,255,0.78)',
            fontSize: labelSize,
            fontWeight: '800',
            letterSpacing: 1.4,
          }}
        >
          {monogram(subject)}
        </Text>
        <View>
          <Text
            numberOfLines={size === 'sm' ? 3 : 4}
            style={{
              color: colors.text.onBrand,
              fontFamily: SERIF_FONT,
              fontSize: titleSize,
              fontWeight: '800',
              lineHeight: titleSize * 1.18,
            }}
          >
            {title}
          </Text>
          {size !== 'sm' && (
            <Text
              numberOfLines={1}
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: labelSize,
                fontWeight: '700',
                letterSpacing: 1,
                marginTop: 6,
                textTransform: 'uppercase',
              }}
            >
              {subject || 'Lesson'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};
