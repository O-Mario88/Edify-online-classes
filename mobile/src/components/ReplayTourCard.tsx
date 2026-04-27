import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingTour } from './OnboardingTour';
import { useOnboardingTour } from '@/onboarding/useOnboardingTour';
import type { TourRole } from '@/onboarding/tours';
import { colors, palette, radius, shadows } from '@/theme';

interface Props {
  role: TourRole;
}

/**
 * Profile-screen affordance that re-opens the role's onboarding tour
 * for users who skipped it the first time or want a refresher. Hosts
 * its own modal so the tour fires inline rather than requiring a
 * navigation hop back to the home tab.
 */
export const ReplayTourCard: React.FC<Props> = ({ role }) => {
  const tour = useOnboardingTour(role);

  return (
    <>
      <Pressable
        onPress={() => { void tour.replay(); }}
        accessibilityRole="button"
        accessibilityLabel="Show me around again"
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface.raised,
            borderRadius: radius.card,
            padding: 14,
            opacity: pressed ? 0.92 : 1,
            ...shadows.xs,
          },
        ]}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: radius.md,
            backgroundColor: palette.navy[100],
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="compass-outline" size={20} color={colors.brand.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: colors.text.primary,
            }}
          >
            Show me around again
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.text.muted,
              marginTop: 2,
            }}
          >
            Replay the welcome tour for this role.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.text.soft} />
      </Pressable>
      <OnboardingTour role={tour.role} onClose={tour.dismiss} />
    </>
  );
};
