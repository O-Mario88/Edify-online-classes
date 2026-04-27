import React from 'react';
import { Pressable, Text, ActivityIndicator, View, type PressableProps } from 'react-native';
import { colors, radius } from '@/theme';

interface PrimaryButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

/**
 * Touch-friendly button (48px tall by default — comfortably above iOS
 * 44pt + Android 48dp guidelines). Three variants:
 *   primary  → maple-900 navy fill, white text
 *   secondary → white fill, navy border + text
 *   ghost    → transparent, navy text only
 *
 * Pulls colours + radius from the design-system tokens so a brand
 * change ripples through every CTA in one edit.
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  loading = false,
  variant = 'primary',
  fullWidth = true,
  disabled,
  style,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const baseStyle = {
    height: 48,
    borderRadius: radius.cardLg,
    paddingHorizontal: 20,
    width: fullWidth ? '100%' as const : undefined,
    opacity: isDisabled ? 0.5 : 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: colors.brand.primary }
      : variant === 'secondary'
      ? { backgroundColor: colors.surface.raised, borderWidth: 1, borderColor: colors.brand.primary }
      : { backgroundColor: 'transparent' };

  const textColor = variant === 'primary' ? colors.text.onBrand : colors.brand.primary;
  const spinnerColor = variant === 'primary' ? colors.text.onBrand : colors.brand.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={[baseStyle, variantStyle, style as any]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: textColor, fontWeight: '700', fontSize: 15 }}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
};
