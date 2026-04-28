import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { InvitationSheet } from '@/components/InvitationSheet';
import { institutionMatchApi, type AnonymizedStudentSummary } from '@/api/institutionMatch.api';

/**
 * Anonymised learner detail. Shows enough evidence for an admissions
 * decision (lane, signals, badges, match reasons, openness flags) but
 * never PII. Identity surfaces only after the parent accepts an
 * invitation in Phase 9.4.
 */
export default function InstitutionStudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnonymizedStudentSummary | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const { data: payload, error: err } = await institutionMatchApi.studentSummary(id);
      if (cancelled) return;
      setLoading(false);
      if (err || !payload) {
        setError(err?.message || 'Could not load this learner.');
        return;
      }
      setData(payload);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return null;
  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View className="px-5 pt-6"><LoadingSkeleton height={120} lines={4} /></View>
      </SafeAreaView>
    );
  }
  if (error || !data) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View className="px-5 pt-6"><ErrorState message={error || undefined} onRetry={() => setLoading(true)} /></View>
      </SafeAreaView>
    );
  }
  if (!data.visible) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View className="px-6 pt-12 items-center">
          <View className="w-14 h-14 rounded-full bg-slate-100 items-center justify-center mb-3">
            <Ionicons name="lock-closed-outline" size={26} color="#475569" />
          </View>
          <Text className="text-2xl font-extrabold text-slate-900 text-center">Not visible</Text>
          <Text className="text-sm text-slate-600 mt-2 text-center max-w-sm leading-relaxed">
            {data.detail || 'This learner is no longer eligible or has rolled back their parent\'s opt-in.'}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 px-5 py-3 rounded-full bg-maple-900"
          >
            <Text className="text-sm font-bold text-white">Back to recommended</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const laneTint = data.lane === 'high_performer'
    ? { bg: '#D1FAE5', fg: '#065F46' }
    : { bg: '#FEF3C7', fg: '#92400E' };

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
              className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
              style={{ backgroundColor: laneTint.bg }}
            >
              <Ionicons name={data.lane === 'high_performer' ? 'trophy-outline' : 'trending-up-outline'} size={32} color={laneTint.fg} />
            </View>
            <Text className="text-[11px] font-bold uppercase tracking-wider" style={{ color: laneTint.fg }}>
              {data.lane_label}
            </Text>
            <Text className="text-2xl font-extrabold text-slate-900 mt-1">{data.class_level} learner</Text>
            <Text className="text-sm text-slate-500 mt-1">
              {data.region || 'Region pending'}{data.country ? ` · ${data.country}` : ''}
              {data.curriculum ? ` · ${data.curriculum}` : ''}
            </Text>
            <View className="mt-3 px-3 py-1 rounded-full" style={{ backgroundColor: '#0F2A45' }}>
              <Text className="text-[11px] font-bold text-white">
                Readiness {Math.round(data.overall_readiness_score || 0)} / 100
              </Text>
            </View>
          </View>

          {/* Why matched */}
          {data.reasons && data.reasons.length > 0 && (
            <Section label="Why this learner was suggested">
              <View className="bg-white rounded-2xl p-4" style={cardShadow}>
                {data.reasons.map((r, i) => (
                  <View key={i} className={`flex-row items-start ${i > 0 ? 'mt-2.5' : ''}`}>
                    <Ionicons name="checkmark" size={16} color="#0F2A45" style={{ marginTop: 2 }} />
                    <Text className="flex-1 ml-2 text-sm text-slate-800 leading-relaxed">{r}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Signals */}
          <Section label="Learning signals">
            <SignalRow label="Activity"          value={data.signals?.activity || 0} />
            <SignalRow label="Academic"          value={data.signals?.academic || 0} />
            <SignalRow label="Improvement"       value={data.signals?.improvement || 0} />
            <SignalRow label="Exam readiness"    value={data.signals?.exam_readiness || 0} />
            <SignalRow label="Project work"      value={data.signals?.project || 0} />
            {typeof data.signals?.teacher_feedback === 'number' && (
              <SignalRow label="Teacher feedback" value={data.signals.teacher_feedback} />
            )}
          </Section>

          {/* Badges */}
          {data.badges && data.badges.length > 0 && (
            <Section label="Earned badges">
              {data.badges.map((b) => (
                <View key={b.slug} className="bg-white rounded-2xl p-4 mb-3 flex-row items-start" style={cardShadow}>
                  <View className="w-10 h-10 rounded-2xl bg-amber-100 items-center justify-center mr-3">
                    <Ionicons name="medal-outline" size={18} color="#92400E" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900">{b.title}</Text>
                    <Text className="text-xs text-slate-500 mt-0.5 leading-relaxed">{b.description}</Text>
                  </View>
                </View>
              ))}
            </Section>
          )}

          {/* Openness */}
          {data.preferences && (
            <Section label="Open to">
              <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                {data.preferences.open_to_day && <Tag label="Day school" />}
                {data.preferences.open_to_boarding && <Tag label="Boarding" />}
                {data.preferences.open_to_scholarships && <Tag label="Scholarships" />}
                {data.preferences.open_to_school_visit_invites && <Tag label="School visit" />}
                {data.preferences.open_to_preview_class_invites && <Tag label="Preview class" />}
                {data.preferences.national_search_only && <Tag label="National only" />}
              </View>
            </Section>
          )}
        </ScrollView>

        {/* Sticky CTAs */}
        <View className="absolute left-0 right-0 bottom-0 px-6 pb-6 flex-row" style={{ gap: 8 }}>
          <Pressable
            onPress={() => router.back()}
            className="flex-1 py-3 rounded-full items-center"
            style={{ backgroundColor: '#F1F5F9' }}
          >
            <Text className="text-sm font-bold text-slate-700">Hide</Text>
          </Pressable>
          <Pressable
            onPress={() => setInviteOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Invite this learner"
            className="flex-[2] py-3 rounded-full items-center bg-maple-900"
          >
            <Text className="text-sm font-bold text-white">Invite this learner</Text>
          </Pressable>
        </View>

        <InvitationSheet
          visible={inviteOpen}
          studentId={Number(id)}
          defaultReasons={data.reasons || []}
          onClose={() => setInviteOpen(false)}
        />
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

const SignalRow: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const fg = value >= 75 ? '#065F46' : value >= 50 ? '#92400E' : '#9F1239';
  return (
    <View className="bg-white rounded-2xl p-3.5 mb-2.5" style={cardShadow}>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-slate-900">{label}</Text>
        <Text className="text-sm font-extrabold" style={{ color: fg }}>{Math.round(value)}</Text>
      </View>
      <View className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
        <View className="h-full" style={{ width: `${Math.max(2, Math.min(100, value))}%`, backgroundColor: fg }} />
      </View>
    </View>
  );
};

const Tag: React.FC<{ label: string }> = ({ label }) => (
  <View className="px-2.5 py-1 rounded-full bg-emerald-50">
    <Text className="text-[11px] font-semibold text-emerald-800">{label}</Text>
  </View>
);
