import React, { useEffect, useState } from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface AnimatedWifiBarsProps {
  /** Width of the bounding box. The SVG keeps a 1:1 aspect ratio. */
  size?: number;
  /** Stroke colour for the active arcs. Defaults to maple-navy. */
  color?: string;
  /** Stroke colour for inactive arcs. Defaults to a soft slate-200. */
  inactiveColor?: string;
  /** Time (ms) between each step. Lower = faster animation. */
  intervalMs?: number;
  /** Animate forever? Default true. */
  loop?: boolean;
  /** When false, the component renders all bars in `color` at full
   *  opacity (use this for static placement once the splash is done). */
  animated?: boolean;
}

/**
 * Three-arc WiFi signal that fills sequentially: dot → small arc →
 * medium arc → large arc → repeat. Used in the launch screen and
 * anywhere we want a "Maple is connecting you to learning" vibe.
 *
 * Implementation note: we use plain `useState` + `setInterval` instead
 * of Reanimated worklets. The animation only updates 4× per second and
 * the diff is a colour swap on three arcs — no need to bring the JS
 * thread → UI thread bridge for that.
 */
export const AnimatedWifiBars: React.FC<AnimatedWifiBarsProps> = ({
  size = 88,
  color = '#0F2A45',
  inactiveColor = '#CBD5E1',
  intervalMs = 380,
  loop = true,
  animated = true,
}) => {
  const [step, setStep] = useState(0); // 0 = dot only, 1 = +small, 2 = +medium, 3 = all

  useEffect(() => {
    if (!animated) return;
    const id = window.setInterval(() => {
      setStep((s) => {
        const next = s + 1;
        if (next > 3) return loop ? 0 : 3;
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [animated, intervalMs, loop]);

  // SVG drawn on a 100×100 viewBox so callers can pass any pixel size.
  // The arcs are drawn as stroke paths radiating from the dot at the
  // centre-bottom. Stroke width scales with the size for visual balance.
  const stroke = Math.max(4, size * 0.075);

  const inner = animated ? (step >= 1 ? color : inactiveColor) : color;
  const middle = animated ? (step >= 2 ? color : inactiveColor) : color;
  const outer = animated ? (step >= 3 ? color : inactiveColor) : color;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        {/* Outer arc — widest, top of the signal */}
        <Path
          d="M 14 60 Q 50 14 86 60"
          fill="none"
          stroke={outer}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Middle arc */}
        <Path
          d="M 28 66 Q 50 36 72 66"
          fill="none"
          stroke={middle}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Inner arc — closest to the source */}
        <Path
          d="M 40 72 Q 50 60 60 72"
          fill="none"
          stroke={inner}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Dot at the source */}
        <Circle cx={50} cy={80} r={stroke * 0.9} fill={color} />
      </G>
    </Svg>
  );
};
