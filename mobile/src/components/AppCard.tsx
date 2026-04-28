import React from 'react';
import { View, type ViewProps } from 'react-native';
import { colors, radius, shadows } from '@/theme';

/**
 * Standard rounded card surface — what every section sits inside.
 * Generous radius + soft shadow so it reads as a tactile native
 * element, not a desktop tile. Backed by theme tokens — change
 * `radius.card` or `shadows.sm` once and every card moves.
 */
export const AppCard: React.FC<React.PropsWithChildren<ViewProps>> = ({
  children, className = '', style, ...rest
}) => {
  return (
    <View
      className={className}
      style={[
        {
          backgroundColor: colors.surface.raised,
          borderRadius: radius.card,
          padding: 20,
        },
        shadows.sm,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
