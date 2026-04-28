import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking, ScrollView, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import {
  schoolMatchApi,
  type AdmissionApplication,
  type InstitutionDetail,
} from '@/api/schoolMatch.api';

type State = 'loading' | 'ready' | 'error' | 'submitting' | 'submitted';

/**
 * Institution detail — about / programmes / facilities + a single
 * primary "Apply" CTA. Consent toggle for sharing the Learning
 * Passport sits inside the apply confirmation alert so consent is
 * explicit and transactional, never opaquely default-on.
 */
export default function InstitutionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [state, setState] = useState<State>('loading');
  const [detail, setDetail] = useState<InstitutionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareConsent, setShareConsent] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await schoolMatchApi.detail(id);
      if (cancelled) return;
      if (err || !data) {
        setError(err?.message || 'Could not load this school.');
        setState('error');
        return;
      }
      setDetail(data);
      setState('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onApply = async () => {
    if (!detail) return;
    setState('submitting');
    setError(null);
    const { data: created, error: createErr } = await schoolMatchApi.startApplication(detail.id);
    if (createErr || !created) {
      setError(createErr?.message || 'Could not create your application. Try again.');
      setState('ready');
      return;
    }
    const { error: submitErr } = await schoolMatchApi.submitApplication(created.id, {
      passport_share_consent: shareConsent,
    });
    if (submitErr) {
      setError(submitErr.message || 'Application created but submission failed. Try again from My applications.');
      setState('ready');
      return;
    }
    setState('submitted');
  };

  if (!id) return null;

  if (state === 'loading') {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View className="px-5 pt-6"><LoadingSkeleton height={120} lines={4} /></View>
      </SafeAreaView>
    );
  }
  if (state === 'error' || !detail) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View className="px-5 pt-6"><ErrorState onRetry={() => setState('loading')} /></View>
      </SafeAreaView>
    );
  }
  if (state === 'submitted') {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View className="px-6 pt-12 items-center">
          <View className="w-14 h-14 rounded-full bg-emerald-100 items-center justify-center mb-3">
            <Ionicons name="paper-plane-outline" size={26} color="#065F46" />
          </View>
          <Text className="text-2xl font-extrabold text-slate-900 text-center">Application sent</Text>
          <Text className="text-sm text-slate-600 mt-2 text-center max-w-sm leading-relaxed">
            {detail.name} will review your packet and reach out
            {shareConsent ? ' with your shared Passport visible' : '. Your Passport stays private until you opt in'}.
          </Text>
          <View className="mt-7 flex-row" style={{ gap: 10 }}>
            <Pressable
              onPress={() => router.replace('/(student)/school-match' as any)}
              className="px-5 py-3 rounded-full bg-slate-100"
            >
              <Text className="text-sm font-bold text-slate-700">Back to schools</Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace('/(parent)/applications' as any)}
              className="px-5 py-3 rounded-full bg-maple-900"
            >
              <Text className="text-sm font-bold text-white">My applications</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const confirmApply = () => {
    Alert.alert(
      'Apply to ' + detail.name + '?',
      'We\'ll send the institution your application. Toggle Passport sharing on if you want them to see your verified record.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send application', onPress: onApply },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-2 pb-2">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </Pressable>
          </View>

          {/* Hero */}
          <View className="px-5 mt-2 items-center">
            <View
              className="w-20 h-20 rounded-3xl bg-slate-100 items-center justify-center mb-4"
            >
              <Ionicons name="school-outline" size={32} color="#0F2A45" />
            </View>
            <Text className="text-2xl font-extrabold text-slate-900 text-center" style={{ letterSpacing: -0.3 }}>
              {detail.name}
            </Text>
            <Text className="text-sm text-slate-500 mt-1 text-center">
              {detail.location || 'Location pending'}
              {detail.stage ? ` · ${detail.stage}` : ''}
            </Text>
            {!!detail.tagline && (
              <Text className="text-sm text-slate-700 mt-3 text-center leading-relaxed px-2">
                {detail.tagline}
              </Text>
            )}
            {typeof detail.match_score === 'number' && (
              <View className="mt-3 px-3 py-1 rounded-full" style={{ backgroundColor: '#FEF3C7' }}>
                <Text className="text-[11px] font-bold text-amber-800">
                  {detail.match_score}% match for you
                </Text>
              </View>
            )}
          </View>

          {/* Quick stats */}
          <View className="px-5 mt-6 flex-row" style={{ gap: 8 }}>
            {detail.fees_band && <Stat label="Fees" value={detail.fees_band} />}
            {typeof detail.pass_rate === 'number' && <Stat label="Pass rate" value={`${detail.pass_rate}%`} />}
          </View>

          {detail.match_reasons && detail.match_reasons.length > 0 && (
            <View className="px-5 mt-6">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Why this fits you
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                {detail.match_reasons.map((r, i) => (
                  <View key={i} className="px-2.5 py-1 rounded-full bg-emerald-50">
                    <Text className="text-[11px] font-semibold text-emerald-800">{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {detail.about && (
            <Section label="About">
              <Text className="text-sm text-slate-700 leading-relaxed">{detail.about}</Text>
            </Section>
          )}

          {detail.programmes && detail.programmes.length > 0 && (
            <Section label="Programmes">
              {detail.programmes.map((p, i) => (
                <Bullet key={i} text={p} />
              ))}
            </Section>
          )}

          {detail.facilities && detail.facilities.length > 0 && (
            <Section label="Facilities">
              {detail.facilities.map((f, i) => (
                <Bullet key={i} text={f} />
              ))}
            </Section>
          )}

          {(detail.contact_email || detail.contact_phone || detail.website) && (
            <Section label="Contact">
              {detail.website && (
                <ContactRow icon="globe-outline" text={detail.website} onPress={() => Linking.openURL(detail.website!)} />
              )}
              {detail.contact_email && (
                <ContactRow icon="mail-outline" text={detail.contact_email} onPress={() => Linking.openURL(`mailto:${detail.contact_email}`)} />
              )}
              {detail.contact_phone && (
                <ContactRow icon="call-outline" text={detail.contact_phone} onPress={() => Linking.openURL(`tel:${detail.contact_phone}`)} />
              )}
            </Section>
          )}

          {/* Passport-share consent — explicit, opt-in. */}
          <View className="px-5 mt-6">
            <Pressable
              onPress={() => setShareConsent((s) => !s)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: shareConsent }}
              accessibilityLabel="Share Learning Passport with this school"
              className="bg-white rounded-2xl p-4 flex-row items-center"
              style={cardShadow}
            >
              <View className="w-9 h-9 rounded-2xl bg-amber-100 items-center justify-center mr-3">
                <Ionicons name="ribbon-outline" size={18} color="#92400E" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-sm font-bold text-slate-900">Share my Learning Passport</Text>
                <Text className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Lets the school see your verified Maple record. Off by default. Revoke anytime.
                </Text>
              </View>
              <View
                className="w-5 h-5 rounded items-center justify-center"
                style={{
                  backgroundColor: shareConsent ? '#0F2A45' : 'transparent',
                  borderWidth: shareConsent ? 0 : 2,
                  borderColor: '#CBD5E1',
                }}
              >
                {shareConsent && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
            </Pressable>
          </View>

          {error && (
            <View className="px-5 mt-3">
              <View className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <Text className="text-sm font-medium text-rose-800">{error}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Sticky apply CTA */}
        <View className="absolute left-0 right-0 bottom-0 px-6 pb-6">
          <Pressable
            onPress={confirmApply}
            disabled={state === 'submitting' || detail.accepting_applications === false}
            accessibilityRole="button"
            accessibilityLabel="Apply to this school"
            className="rounded-full py-4 items-center"
            style={{
              backgroundColor: detail.accepting_applications === false ? '#CBD5E1' : '#0F2A45',
              elevation: 4,
              shadowColor: '#0F172A',
              shadowOpacity: 0.16,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
            }}
          >
            <Text className="text-sm font-bold text-white" style={{ letterSpacing: 0.4 }}>
              {detail.accepting_applications === false
                ? 'Not accepting applications right now'
                : state === 'submitting' ? 'Submitting…' : 'Apply to this school'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
});

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

const Section: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
  <View className="px-5 mt-7">
    <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">{label}</Text>
    {children}
  </View>
);

const Bullet: React.FC<{ text: string }> = ({ text }) => (
  <View className="flex-row items-start mb-2">
    <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2.5" />
    <Text className="flex-1 text-sm text-slate-700 leading-relaxed">{text}</Text>
  </View>
);

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View className="flex-1 bg-white rounded-2xl p-4" style={cardShadow}>
    <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</Text>
    <Text className="text-base font-extrabold text-slate-900 mt-1">{value}</Text>
  </View>
);

const ContactRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
}> = ({ icon, text, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="link"
    accessibilityLabel={text}
    className="flex-row items-center py-2"
  >
    <Ionicons name={icon} size={16} color="#475569" />
    <Text className="text-sm text-slate-700 ml-2 flex-1">{text}</Text>
    <Ionicons name="open-outline" size={14} color="#94A3B8" />
  </Pressable>
);
