import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BrandBackground } from './BrandBackground';
import { TOURS, type TourRole, type TourStep } from '@/onboarding/tours';
import { TOUR_TINTS } from '@/onboarding/tints';
import { colors, fontSize, fontWeight, letterSpacing, palette, radius, shadows, space } from '@/theme';

interface Props {
  /** Role whose tour to show. When null the modal is hidden. */
  role: TourRole | null;
  /** Fired when the user finishes or skips. Caller marks the role seen. */
  onClose: () => void;
}

/**
 * Three-step welcome tour shown the first time a role lands on the app.
 *
 * Renders over the brand gradient so it feels like part of the launch
 * experience rather than a regular dialog. Forward-only paging keeps
 * the path short; "Skip" is always available and equivalent to closing.
 */
export const OnboardingTour: React.FC<Props> = ({ role, onClose }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const visible = role !== null;
  const steps = useMemo<TourStep[]>(() => (role ? TOURS[role] : []), [role]);
  const lastVisibleRole = useRef<TourRole | null>(null);

  useEffect(() => {
    if (visible) {
      // Reset to first step whenever the modal opens for a new role.
      if (lastVisibleRole.current !== role) {
        setStepIdx(0);
        lastVisibleRole.current = role;
      }
    } else {
      lastVisibleRole.current = null;
    }
  }, [role, visible]);

  if (!role || steps.length === 0) {
    return <Modal visible={false} transparent animationType="fade" onRequestClose={onClose} />;
  }

  const step = steps[stepIdx];
  const tint = TOUR_TINTS[step.tint];
  const isLast = stepIdx === steps.length - 1;

  const next = () => {
    if (isLast) onClose();
    else setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  };

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <BrandBackground haloY={0.32} />
        <View style={styles.safe}>
          <View style={styles.topRow}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Skip tour"
              hitSlop={12}
            >
              <Text style={styles.skipLabel}>SKIP</Text>
            </Pressable>
          </View>

          <Animated.View
            key={stepIdx}
            entering={FadeIn.duration(220)}
            style={styles.stage}
          >
            <View style={[styles.disc, { backgroundColor: tint.bg }]}>
              <Ionicons name={step.icon} size={48} color={tint.fg} />
            </View>
            <Text style={styles.eyebrow}>STEP {stepIdx + 1} OF {steps.length}</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.body}>{step.body}</Text>
          </Animated.View>

          <View style={styles.footer}>
            <View style={styles.dots}>
              {steps.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === stepIdx ? styles.dotActive : styles.dotIdle,
                  ]}
                />
              ))}
            </View>
            <Pressable
              onPress={next}
              accessibilityRole="button"
              accessibilityLabel={isLast ? 'Get started' : 'Next step'}
              style={({ pressed }) => [
                styles.cta,
                pressed && { opacity: 0.92 },
              ]}
            >
              <Text style={styles.ctaLabel}>{isLast ? 'Get started' : 'Next'}</Text>
              <Ionicons
                name={isLast ? 'checkmark' : 'arrow-forward'}
                size={18}
                color={colors.text.onBrand}
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.canvas },
  safe: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: space.gutter,
    paddingBottom: 44,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: space.lg,
  },
  skipLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold as any,
    letterSpacing: letterSpacing.ui * 3,
    color: palette.slate[500],
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  disc: {
    width: 144,
    height: 144,
    borderRadius: radius.cardLg + 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    ...shadows.sm,
  },
  eyebrow: {
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.bold as any,
    letterSpacing: letterSpacing.ui * 4,
    color: colors.text.muted,
    marginBottom: 12,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold as any,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: letterSpacing.tightHead,
    lineHeight: fontSize['3xl'] * 1.18,
  },
  body: {
    marginTop: 14,
    fontSize: fontSize.base,
    color: colors.text.body,
    textAlign: 'center',
    lineHeight: fontSize.base * 1.55,
    maxWidth: 360,
  },
  footer: {
    paddingTop: space.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotIdle: { backgroundColor: palette.slate[200] },
  dotActive: { backgroundColor: colors.brand.primary, width: 22 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: radius.cardLg,
    paddingVertical: 14,
    ...shadows.md,
  },
  ctaLabel: {
    color: colors.text.onBrand,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold as any,
    letterSpacing: letterSpacing.ui,
  },
});
