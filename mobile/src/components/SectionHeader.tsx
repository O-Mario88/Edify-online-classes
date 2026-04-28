import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, fontSize, fontWeight, radius, shadows } from '@/theme';

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** When set, renders a pill-shaped "See all" button on the right. */
  seeAllLabel?: string;
  onSeeAllPress?: () => void;
  /** Legacy text-arrow action — still supported for places that haven't migrated yet. */
  actionLabel?: string;
  onActionPress?: () => void;
}

/**
 * Section header with two action variants:
 *   - `seeAllLabel` + `onSeeAllPress` → pill-shaped white button (premium)
 *   - `actionLabel` + `onActionPress` → simple text-arrow link (legacy)
 *
 * Used to bookend a list / grid section. Title is bold-extrabold for
 * the editorial weight; action sits at the trailing edge so the eye
 * lands on content first.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  seeAllLabel,
  onSeeAllPress,
  actionLabel,
  onActionPress,
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
    <View style={{ flex: 1, paddingRight: 12 }}>
      <Text style={{
        fontSize: fontSize.lg,
        fontWeight: fontWeight.extrabold as any,
        color: colors.text.primary,
        letterSpacing: -0.3,
      }}>
        {title}
      </Text>
      {!!description && (
        <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }}>
          {description}
        </Text>
      )}
    </View>

    {seeAllLabel && onSeeAllPress && (
      <Pressable
        onPress={onSeeAllPress}
        accessibilityRole="link"
        style={({ pressed }) => [
          {
            backgroundColor: colors.surface.raised,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: radius.pill,
            opacity: pressed ? 0.85 : 1,
            ...shadows.xs,
          },
        ]}
      >
        <Text style={{
          fontSize: fontSize.xs,
          fontWeight: fontWeight.bold as any,
          color: colors.text.body,
          letterSpacing: 0.1,
        }}>
          {seeAllLabel}
        </Text>
      </Pressable>
    )}

    {!seeAllLabel && actionLabel && onActionPress && (
      <Pressable onPress={onActionPress} accessibilityRole="link">
        <Text style={{
          fontSize: fontSize.sm,
          fontWeight: fontWeight.semibold as any,
          color: colors.brand.primary,
        }}>
          {actionLabel} →
        </Text>
      </Pressable>
    )}
  </View>
);
