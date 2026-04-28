import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, RadialGradient } from 'react-native-svg';
import { palette } from '@/theme';

interface Props {
  /** Vertical position (0..1) of the warm halo behind the brand mark.
   *  Auth screens default to the upper third where the logo sits. */
  haloY?: number;
}

/**
 * Soft, premium background used behind the brand mark on every
 * pre-auth surface. Two layers:
 *   1. A subtle vertical gradient — warm white at the top, cool slate
 *      at the bottom. Adds depth without competing with the artwork.
 *   2. A bronze radial "halo" centred behind the logo so it lifts off
 *      the page like a print on linen rather than a sticker on paper.
 *
 * Implemented with react-native-svg (already a dependency) so we don't
 * need to pull in expo-linear-gradient.
 */
export const BrandBackground: React.FC<Props> = ({ haloY = 0.35 }) => (
  <Svg style={StyleSheet.absoluteFillObject} preserveAspectRatio="none">
    <Defs>
      {/* Warm-cool vertical gradient. Tokens correspond to Tailwind
          `canvas.warm` / canvas DEFAULT / `canvas.cool`. */}
      <LinearGradient id="brand-bg" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FBFAF7" />
        <Stop offset="0.55" stopColor="#F2F4F8" />
        <Stop offset="1" stopColor="#E6ECF3" />
      </LinearGradient>
      {/* Bronze halo — `palette.bronze[200]`. */}
      <RadialGradient
        id="brand-halo"
        cx="50%"
        cy={`${haloY * 100}%`}
        rx="60%"
        ry="38%"
      >
        <Stop offset="0" stopColor={palette.bronze[200]} stopOpacity="0.35" />
        <Stop offset="1" stopColor={palette.bronze[200]} stopOpacity="0" />
      </RadialGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill="url(#brand-bg)" />
    <Rect x="0" y="0" width="100%" height="100%" fill="url(#brand-halo)" />
  </Svg>
);
