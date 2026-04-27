import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useCountry } from '@/hooks/useCountry';
import { colors, palette } from '@/theme';

interface Props {
  /** Tap target — typically opens the country picker sheet. */
  onPress?: () => void;
  /** Variant: 'subtle' is for in-content placement, 'prominent' for headers. */
  variant?: 'subtle' | 'prominent';
}

/**
 * Tiny country-flag chip used on auth surfaces and role homes so the
 * user can see which country/curriculum context Maple is showing them.
 * Tapping opens whatever picker the parent renders (we don't navigate
 * here so the chip works inside both push routes and modals).
 */
export const CountryChip: React.FC<Props> = ({ onPress, variant = 'subtle' }) => {
  const { config } = useCountry();
  const Container: any = onPress ? Pressable : View;
  const isSubtle = variant === 'subtle';
  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${config.name} — tap to change country`}
      className="flex-row items-center px-2.5 py-1 rounded-full"
      style={{
        backgroundColor: isSubtle ? palette.slate[100] : 'rgba(255,255,255,0.16)',
        borderWidth: isSubtle ? 1 : 0,
        borderColor: isSubtle ? palette.slate[200] : 'transparent',
      }}
    >
      <Text style={{ fontSize: 14 }}>{config.flag}</Text>
      <Text
        className="ml-1.5 text-[11px] font-bold"
        style={{ color: isSubtle ? colors.text.primary : colors.text.onBrand, letterSpacing: 0.5 }}
      >
        {config.code}
      </Text>
      {onPress && (
        <Text className="ml-1 text-[11px]" style={{ color: isSubtle ? colors.text.soft : 'rgba(255,255,255,0.65)' }}>
          ▾
        </Text>
      )}
    </Container>
  );
};
