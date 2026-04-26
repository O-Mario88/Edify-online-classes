import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Polygon, Rect } from 'react-native-svg';
import { AnimatedWifiBars } from './AnimatedWifiBars';

interface MapleLogoProps {
  /** Total height of the brand mark (icon block only — wordmark adds more). */
  size?: number;
  /** Render the wordmark "MAPLE / Online School" under the icon. */
  showWordmark?: boolean;
  /** Animate the WiFi arcs. Defaults to true on launch, false for header use. */
  animated?: boolean;
  /** Override the navy. */
  primaryColor?: string;
  /** Override the bronze. */
  accentColor?: string;
}

/**
 * SVG version of the Maple Online School brand mark, built from
 * geometric primitives so it stays sharp at every size and lets the
 * WiFi bars animate at 60fps.
 *
 * The mark composes four motifs from the source illustration:
 *   1. Graduation cap (bronze) at the top — the school
 *   2. Maple leaf silhouette (navy) — the brand name
 *   3. Open book (navy + bronze pages) — learning
 *   4. Animated WiFi (navy) — "live, online, connected"
 *
 * It's not a pixel clone of the rendered marketing logo, but it
 * captures the same iconography in a native-friendly form.
 */
export const MapleLogo: React.FC<MapleLogoProps> = ({
  size = 96,
  showWordmark = false,
  animated = true,
  primaryColor = '#0F2A45',
  accentColor = '#B86E3C',
}) => {
  // The icon block is drawn on a 100×100 viewBox. The WiFi sits
  // visually between the cap and the leaf, so we overlay it as an
  // absolute child positioned at roughly 28% from the top.
  return (
    <View accessibilityLabel="Maple Online School" style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* Graduation cap — top */}
          <Polygon points="50,8 86,22 50,36 14,22" fill={accentColor} />
          {/* Cap underside (subtle band) */}
          <Polygon points="22,24 78,24 50,33" fill={primaryColor} opacity={0.15} />
          {/* Tassel string */}
          <Path
            d="M 84 22 L 86 30 L 87 40"
            stroke={accentColor}
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
          />
          {/* Tassel knob */}
          <Polygon points="86,40 90,40 88,46" fill={accentColor} />

          {/* Open book base (navy spread) */}
          <Path
            d="M 12 78 L 50 70 L 88 78 L 88 90 L 50 84 L 12 90 Z"
            fill={primaryColor}
          />
          {/* Book pages (bronze accents) */}
          <Path
            d="M 18 80 L 48 73 L 48 84 L 18 88 Z"
            fill={accentColor}
            opacity={0.85}
          />
          <Path
            d="M 82 80 L 52 73 L 52 84 L 82 88 Z"
            fill={accentColor}
            opacity={0.85}
          />
          {/* Spine */}
          <Rect x={49} y={70} width={2} height={16} fill={primaryColor} />

          {/* Maple-leaf silhouette in front of the book — simplified,
              navy. Sits centred over the pages. */}
          <Polygon
            points="50,42 56,46 60,42 58,52 64,52 56,58 58,64 50,60 42,64 44,58 36,52 42,52 40,42 44,46"
            fill={primaryColor}
          />
        </Svg>

        {/* WiFi arcs overlay — sized so the animation feels lively but
            doesn't compete with the leaf below. */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.32,
            left: size * 0.3,
            width: size * 0.4,
            height: size * 0.4,
          }}
          pointerEvents="none"
        >
          <AnimatedWifiBars
            size={size * 0.4}
            color={primaryColor}
            inactiveColor="#E2E8F0"
            animated={animated}
          />
        </View>
      </View>

      {showWordmark && (
        <View style={{ marginTop: size * 0.18, alignItems: 'center' }}>
          <Text
            style={{
              color: primaryColor,
              fontSize: Math.round(size * 0.32),
              fontWeight: '900',
              letterSpacing: Math.round(size * 0.045),
            }}
          >
            MAPLE
          </Text>
          <Text
            style={{
              color: accentColor,
              fontSize: Math.round(size * 0.13),
              fontWeight: '700',
              letterSpacing: Math.round(size * 0.025),
              marginTop: size * 0.04,
            }}
          >
            ONLINE SCHOOL
          </Text>
        </View>
      )}
    </View>
  );
};
