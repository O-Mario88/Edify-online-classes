import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PlanKey, UpgradeStatus } from '@/api/payments.api';
import { priceLabelFor, type PlanCopy } from '@/config/plans';
import { useCountry } from '@/hooks/useCountry';
import { colors, palette, shadows } from '@/theme';

interface Props {
  plan: PlanCopy;
  /** True when this plan is currently active for the user. */
  active?: boolean;
  /** When set, shows a status pill instead of the upgrade CTA. */
  pending?: UpgradeStatus | null;
  /** Tapped on the primary CTA. Hidden when active or pending. */
  onUpgrade?: () => void;
}

const STATUS_TINT: Record<UpgradeStatus, { bg: string; fg: string; label: string }> = {
  pending:   { bg: palette.amber[50],   fg: palette.amber[800],   label: 'Awaiting approval' },
  approved:  { bg: palette.emerald[50], fg: palette.emerald[800], label: 'Approved' },
  rejected:  { bg: palette.rose[50],    fg: palette.rose[800],    label: 'Not approved' },
  cancelled: { bg: palette.slate[200],  fg: palette.slate[600],   label: 'Cancelled' },
};

/**
 * Plan card used in the plan-comparison surfaces. Renders the plan
 * name, audience, price, benefit list, "what happens after payment"
 * footer, and either a request-upgrade CTA, an active pill, or a
 * pending-status pill depending on the user's relationship to the plan.
 */
export const PlanCard: React.FC<Props> = ({ plan, active, pending, onUpgrade }) => {
  const { code } = useCountry();
  const priceLabel = priceLabelFor(plan.key as PlanKey, code);
  return (
    <View
      className="bg-white rounded-3xl p-5 mb-3"
      style={[
        shadows.md,
        active ? { borderWidth: 2, borderColor: colors.brand.primary } : undefined,
      ]}
    >
      <View className="flex-row items-start">
        <View className="flex-1 pr-2">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {plan.audience}
          </Text>
          <Text className="text-xl font-extrabold text-slate-900 mt-0.5">{plan.name}</Text>
        </View>
        {active && (
          <View className="px-2 py-0.5 rounded-full bg-maple-900">
            <Text className="text-[10px] font-bold text-white">CURRENT</Text>
          </View>
        )}
        {!active && pending && (
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: STATUS_TINT[pending].bg }}
          >
            <Text className="text-[10px] font-bold" style={{ color: STATUS_TINT[pending].fg }}>
              {STATUS_TINT[pending].label.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-baseline mt-3">
        <Text className="text-3xl font-extrabold text-slate-900">{priceLabel}</Text>
        {!!plan.cadence && priceLabel !== 'Contact us' && priceLabel !== 'Free' && (
          <Text className="text-sm font-bold text-slate-500 ml-1">{plan.cadence}</Text>
        )}
      </View>

      <View className="mt-4">
        {plan.benefits.map((b, i) => (
          <View key={i} className="flex-row items-start mb-2">
            <Ionicons name="checkmark" size={16} color={colors.brand.primary} style={{ marginTop: 2 }} />
            <Text className="flex-1 ml-2 text-sm text-slate-700 leading-relaxed">{b}</Text>
          </View>
        ))}
      </View>

      {!active && !pending && plan.key !== 'free' && onUpgrade && (
        <Pressable
          onPress={onUpgrade}
          accessibilityRole="button"
          accessibilityLabel={`Request ${plan.name}`}
          className="mt-4 py-3 rounded-2xl items-center bg-maple-900"
        >
          <Text className="text-sm font-bold text-white">
            {priceLabel === 'Contact us' ? 'Talk to Maple' : `Request ${plan.name}`}
          </Text>
        </Pressable>
      )}

      <View className="mt-3 pt-3 border-t border-slate-100">
        <Text className="text-[11px] text-slate-500 leading-relaxed">{plan.trustNote}</Text>
        <Text className="text-[11px] text-slate-500 leading-relaxed mt-1">
          <Text className="font-bold">What happens after: </Text>{plan.afterApproval}
        </Text>
      </View>
    </View>
  );
};

