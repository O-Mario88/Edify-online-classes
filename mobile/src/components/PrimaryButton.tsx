import React from 'react';
import { Pressable, Text, ActivityIndicator, View, type PressableProps } from 'react-native';

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
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  loading = false,
  variant = 'primary',
  fullWidth = true,
  disabled,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const containerCls = (() => {
    const base = `h-12 rounded-2xl flex-row items-center justify-center px-5 ${fullWidth ? 'w-full' : ''}`;
    if (variant === 'primary') return `${base} bg-maple-900 ${isDisabled ? 'opacity-50' : ''}`;
    if (variant === 'secondary') return `${base} bg-white border border-maple-900 ${isDisabled ? 'opacity-50' : ''}`;
    return `${base} bg-transparent ${isDisabled ? 'opacity-50' : ''}`;
  })();

  const textCls =
    variant === 'primary' ? 'text-white font-bold text-base' : 'text-maple-900 font-bold text-base';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={containerCls}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#0F2A45'} />
      ) : (
        <View className="flex-row items-center justify-center">
          <Text className={textCls}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
};
