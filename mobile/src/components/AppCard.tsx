import React from 'react';
import { View, type ViewProps } from 'react-native';

/**
 * Standard rounded card surface — what every section sits inside.
 * Generous radius + soft shadow so it reads as a tactile native
 * element, not a desktop tile.
 */
export const AppCard: React.FC<React.PropsWithChildren<ViewProps>> = ({ children, className = '', ...rest }) => {
  return (
    <View
      className={`bg-white rounded-2xl p-5 shadow-sm ${className}`}
      style={{
        // Soft elevation. RN's `shadow-*` Tailwind utilities only
        // affect iOS — supply a rough Android equivalent here.
        elevation: 1,
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
      {...rest}
    >
      {children}
    </View>
  );
};
