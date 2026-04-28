import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paymentsApi, type PaymentMethod, type PlanKey } from '@/api/payments.api';
import { priceLabelFor, type PlanCopy } from '@/config/plans';
import { useCountry } from '@/hooks/useCountry';
import { colors, palette } from '@/theme';

interface Props {
  plan: PlanCopy | null;
  onClose: () => void;
  /** Called once the request POST succeeds. The parent re-fetches my-requests. */
  onSubmitted: () => void;
}

/**
 * Bottom-sheet for requesting an upgrade. Captures contact phone +
 * preferred payment method + an optional note, POSTs to
 * /pilot-payments/upgrade-requests/, and surfaces the submission
 * confirmation. Pilot flow: admin approves manually within 24h.
 *
 * Payment method options + price labels are pulled from the country
 * preference, so a Ugandan user sees MTN/Airtel + UGX while a Kenyan
 * user sees M-Pesa/Airtel + KES.
 */
export const UpgradeRequestSheet: React.FC<Props> = ({ plan, onClose, onSubmitted }) => {
  const { config: country } = useCountry();
  const methods = country.payment_methods.map((m) => ({
    key: m.key as PaymentMethod,
    label: m.label,
    hint: m.hint,
  }));
  const priceLabel = plan ? priceLabelFor(plan.key, country.code) : '';

  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reset = () => {
    setPhone(''); setMethod(''); setNote(''); setError(null); setDone(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!plan) return;
    setError(null);
    if (phone.trim().length < 7) {
      setError('Add a phone number we can reach you on.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await paymentsApi.requestUpgrade({
      plan: plan.key as PlanKey,
      contact_phone: phone,
      preferred_method: method,
      note,
    });
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Could not send your request. Try again.');
      return;
    }
    setDone(true);
    onSubmitted();
  };

  return (
    <Modal visible={!!plan} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: colors.surface.overlay, justifyContent: 'flex-end' }}
      >
        <View className="bg-white rounded-t-3xl px-6 pt-5 pb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-extrabold text-slate-900">
              {plan ? `Upgrade to ${plan.name}` : 'Upgrade'}
            </Text>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={palette.slate[600]} />
            </Pressable>
          </View>

          {done ? (
            <View className="items-center py-2">
              <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mb-3">
                <Ionicons name="checkmark" size={22} color={palette.emerald[800]} />
              </View>
              <Text className="text-base font-extrabold text-slate-900">Request received</Text>
              <Text className="text-sm text-slate-600 mt-2 text-center max-w-xs leading-relaxed">
                A Maple admin will reach out on your phone within 24 hours to confirm payment and unlock the plan.
              </Text>
              <Pressable
                onPress={close}
                className="mt-5 py-3 px-6 rounded-full bg-maple-900"
              >
                <Text className="text-sm font-bold text-white">Got it</Text>
              </Pressable>
            </View>
          ) : plan ? (
            <View>
              <View className="bg-slate-50 rounded-2xl p-3 mb-4">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Plan</Text>
                <Text className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {plan.name} — {priceLabel}{plan.cadence || ''}
                </Text>
                <Text className="text-[11px] text-slate-500 mt-1">{plan.afterApproval}</Text>
              </View>

              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Contact phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="0700 000 000"
                placeholderTextColor={colors.text.soft}
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900"
              />

              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-2">
                Preferred payment
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {methods.map((m) => {
                  const on = method === m.key;
                  return (
                    <Pressable
                      key={m.key}
                      onPress={() => setMethod(on ? '' : m.key)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 9,
                        borderRadius: 14,
                        backgroundColor: on ? colors.text.primary : colors.surface.raised,
                        borderWidth: 1,
                        borderColor: on ? colors.text.primary : colors.border.default,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: on ? colors.text.onBrand : palette.slate[600] }}>
                        {m.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-4 mb-2">
                Note (optional)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Anything we should know."
                placeholderTextColor={colors.text.soft}
                className="rounded-xl border border-slate-200 bg-white p-4 text-base text-slate-900 min-h-[80px]"
              />

              {error && (
                <View className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <Text className="text-sm font-medium text-rose-800">{error}</Text>
                </View>
              )}

              <Pressable
                onPress={submit}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Submit upgrade request"
                className="mt-4 py-3 rounded-2xl items-center bg-maple-900"
              >
                <Text className="text-sm font-bold text-white">
                  {submitting ? 'Sending…' : 'Send request'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => Linking.openURL('mailto:support@maple.edify')}
                className="mt-3 py-2 items-center"
              >
                <Text className="text-[11px] text-slate-500">
                  Need help? <Text className="font-bold text-maple-900">support@maple.edify</Text>
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
