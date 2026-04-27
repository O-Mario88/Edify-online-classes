import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiQuery } from '@/hooks/useApiQuery';
import { paymentsApi, type PremiumAccess, type UpgradeRequestDto, type PlanKey } from '@/api/payments.api';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { PlanCard } from '@/components/PlanCard';
import { UpgradeRequestSheet } from '@/components/UpgradeRequestSheet';
import { PLAN_CATALOGUE, type PlanCopy } from '@/config/plans';
import { colors, palette, shadows } from '@/theme';

interface Props {
  /** Plan keys to render in the comparison list. */
  planKeys: PlanKey[];
  /** Header eyebrow + title shown above the list. */
  eyebrow: string;
  title: string;
  subtitle: string;
}

/**
 * Shared payments / plan-comparison surface used by the student
 * `payment` screen and the parent `pay` screen. Three sections:
 *
 *   1. Current plan card (or "You're on Free" when no premium row).
 *   2. Plan comparison list (PlanCard per available plan).
 *   3. My requests history with status pills.
 *
 * The upgrade flow opens a UpgradeRequestSheet, which POSTs to
 * /pilot-payments/upgrade-requests/. Approval is manual today and
 * arrives via WhatsApp / phone within ~24h per the pilot copy.
 */
export const PaymentsSurface: React.FC<Props> = ({ planKeys, eyebrow, title, subtitle }) => {
  const [upgradePlan, setUpgradePlan] = useState<PlanCopy | null>(null);

  const accessQuery = useApiQuery<PremiumAccess[]>(
    ['payments-premium-access'],
    () => paymentsApi.myPremiumAccess(),
    { staleTime: 60_000 },
  );
  const requestsQuery = useApiQuery<UpgradeRequestDto[]>(
    ['payments-my-requests'],
    () => paymentsApi.myUpgradeRequests(),
    { staleTime: 60_000 },
  );

  const access = accessQuery.data ?? [];
  const requests = requestsQuery.data ?? [];

  const activeByPlan = useMemo(() => {
    const map: Partial<Record<PlanKey, PremiumAccess>> = {};
    access.forEach((a) => { if (a.is_active) map[a.plan as PlanKey] = a; });
    return map;
  }, [access]);

  const pendingByPlan = useMemo(() => {
    const map: Partial<Record<PlanKey, UpgradeRequestDto>> = {};
    requests.forEach((r) => {
      if (r.status === 'pending') map[r.plan] = r;
    });
    return map;
  }, [requests]);

  const onUpgradeSubmitted = async () => {
    await Promise.all([accessQuery.refetch(), requestsQuery.refetch()]);
  };

  const isLoading = (accessQuery.isLoading && access.length === 0) || (requestsQuery.isLoading && requests.length === 0);

  return (
    <View>
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{eyebrow}</Text>
        <Text className="text-2xl font-extrabold text-slate-900">{title}</Text>
        <Text className="text-sm text-slate-600 mt-1">{subtitle}</Text>
      </View>

      {isLoading ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : accessQuery.isError ? (
        <View className="px-5"><ErrorState onRetry={() => accessQuery.refetch()} /></View>
      ) : (
        <>
          {/* Current plan summary */}
          <View className="px-5 mb-4">
            <CurrentPlanCard access={access} />
          </View>

          {/* Plan comparison */}
          <View className="px-5">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Plans
            </Text>
            {planKeys.map((key) => {
              const plan = PLAN_CATALOGUE[key];
              return (
                <PlanCard
                  key={key}
                  plan={plan}
                  active={!!activeByPlan[key] || (key === 'free' && !Object.keys(activeByPlan).length)}
                  pending={pendingByPlan[key] ? 'pending' : null}
                  onUpgrade={() => setUpgradePlan(plan)}
                />
              );
            })}
          </View>

          {/* Request history */}
          {requests.length > 0 && (
            <View className="px-5 mt-3">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                My requests
              </Text>
              {requests.map((r) => <RequestRow key={r.id} r={r} />)}
            </View>
          )}
        </>
      )}

      <UpgradeRequestSheet
        plan={upgradePlan}
        onClose={() => setUpgradePlan(null)}
        onSubmitted={onUpgradeSubmitted}
      />
    </View>
  );
};

const CurrentPlanCard: React.FC<{ access: PremiumAccess[] }> = ({ access }) => {
  const active = access.filter((a) => a.is_active);
  if (active.length === 0) {
    return (
      <View
        className="rounded-3xl p-5 flex-row items-center"
        style={{ backgroundColor: palette.slate[100] }}
      >
        <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
          <Ionicons name="leaf-outline" size={22} color={colors.brand.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current plan</Text>
          <Text className="text-base font-extrabold text-slate-900 mt-0.5">Free</Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            Pick a premium plan below to unlock guided practice, exam prep, and the Passport.
          </Text>
        </View>
      </View>
    );
  }
  const a = active[0];
  const planName = PLAN_CATALOGUE[a.plan as PlanKey]?.name || a.plan;
  return (
    <View
      className="rounded-3xl p-5 flex-row items-center"
      style={[shadows.sm, { backgroundColor: colors.brand.primary }]}
    >
      <View className="w-11 h-11 rounded-2xl bg-white/10 items-center justify-center mr-3">
        <Ionicons name="sparkles-outline" size={22} color={colors.brand.accent} />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Current plan</Text>
        <Text className="text-base font-extrabold text-white mt-0.5">{planName}</Text>
        <Text className="text-xs text-slate-300 mt-0.5">
          {a.expires_at
            ? `Active until ${new Date(a.expires_at).toLocaleDateString()}`
            : 'Active — no expiry on file'}
        </Text>
      </View>
    </View>
  );
};

const STATUS_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  pending:   { bg: palette.amber[50],    fg: palette.amber[800],   label: 'Awaiting approval' },
  approved:  { bg: palette.emerald[50],  fg: palette.emerald[800], label: 'Approved' },
  rejected:  { bg: palette.rose[50],     fg: palette.rose[800],    label: 'Not approved' },
  cancelled: { bg: palette.slate[200],   fg: palette.slate[600],   label: 'Cancelled' },
};

const RequestRow: React.FC<{ r: UpgradeRequestDto }> = ({ r }) => {
  const tint = STATUS_TINT[r.status] || STATUS_TINT.pending;
  const planName = PLAN_CATALOGUE[r.plan as PlanKey]?.name || r.plan;
  return (
    <View className="bg-white rounded-2xl p-4 mb-3" style={shadows.sm}>
      <View className="flex-row items-center mb-1.5">
        <View
          className="px-2 py-0.5 rounded-full mr-2"
          style={{ backgroundColor: tint.bg }}
        >
          <Text className="text-[10px] font-bold" style={{ color: tint.fg }}>
            {tint.label.toUpperCase()}
          </Text>
        </View>
        <Text className="text-[11px] text-slate-400 ml-auto">
          {new Date(r.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text className="text-sm font-extrabold text-slate-900">{planName}</Text>
      {!!r.preferred_method && (
        <Text className="text-[11px] text-slate-500 mt-0.5">
          Pay via {r.preferred_method.replace('_', ' ')}
          {r.contact_phone ? ` · ${r.contact_phone}` : ''}
        </Text>
      )}
      {!!r.admin_note && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Admin note</Text>
          <Text className="text-xs text-slate-700 leading-relaxed">{r.admin_note}</Text>
        </View>
      )}
    </View>
  );
};
