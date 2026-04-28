import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Linking, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { schoolMatchApi, type ParentInvitation } from '@/api/schoolMatch.api';

const INVITATION_LABEL: Record<string, string> = {
  apply: 'Invitation to apply',
  interview: 'Invitation for interview',
  entrance_assessment: 'Entrance assessment invitation',
  school_visit: 'School visit invitation',
  preview_class: 'Preview class invitation',
  scholarship: 'Scholarship offer',
  boarding_admission: 'Boarding admission discussion',
  passport_access_request: 'Passport access request',
  information_request: 'Information request',
};

/**
 * Parent invitation detail. The first GET also marks the invitation
 * `viewed` server-side so the institution sees the parent has read it.
 *
 * Accept reveals institution contact details (email / phone / website)
 * inline so the parent can reach out directly. Decline simply moves
 * the row out of the awaiting list.
 */
export default function ParentInvitationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<ParentInvitation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reload = async () => {
    if (!id) return;
    setError(null);
    const { data, error: err } = await schoolMatchApi.invitationDetail(id);
    setLoading(false);
    if (err || !data) {
      setError(err?.message || 'Could not load this invitation.');
      return;
    }
    setInvitation(data);
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onAccept = () => {
    if (!invitation) return;
    Alert.alert(
      `Accept invitation from ${invitation.institution.name}?`,
      'They will receive your contact details so they can follow up about this invitation. Your child\'s identity stays anonymised until you choose to share more.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setSubmitting(true);
            const { data, error: err } = await schoolMatchApi.acceptInvitation(invitation.id);
            setSubmitting(false);
            if (err) {
              Alert.alert('Could not accept', err.message || 'Try again.');
              return;
            }
            if (data?.invitation) setInvitation(data.invitation);
          },
        },
      ],
    );
  };

  const onDecline = () => {
    if (!invitation) return;
    Alert.alert(
      'Decline invitation?',
      'The school will be notified and won\'t be able to send another invitation for the same opportunity.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            const { data, error: err } = await schoolMatchApi.declineInvitation(invitation.id);
            setSubmitting(false);
            if (err) {
              Alert.alert('Could not decline', err.message || 'Try again.');
              return;
            }
            if (data?.invitation) setInvitation(data.invitation);
          },
        },
      ],
    );
  };

  if (!id) return null;
  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View className="px-5 pt-6"><LoadingSkeleton height={120} lines={4} /></View>
      </SafeAreaView>
    );
  }
  if (error || !invitation) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View className="px-5 pt-6"><ErrorState onRetry={reload} message={error || undefined} /></View>
      </SafeAreaView>
    );
  }

  const accepted = invitation.status === 'accepted';
  const declined = invitation.status === 'declined' || invitation.status === 'expired';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
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
            <View className="w-20 h-20 rounded-3xl bg-slate-100 items-center justify-center mb-4">
              <Ionicons name="business-outline" size={32} color="#0F2A45" />
            </View>
            <Text className="text-2xl font-extrabold text-slate-900 text-center">
              {invitation.institution.name}
            </Text>
            <Text className="text-sm text-slate-500 mt-1 text-center">
              {invitation.institution.location || 'Location pending'}
            </Text>
            <View
              className="mt-3 px-3 py-1 rounded-full"
              style={{ backgroundColor: accepted ? '#D1FAE5' : declined ? '#E2E8F0' : '#FEF3C7' }}
            >
              <Text
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: accepted ? '#065F46' : declined ? '#475569' : '#92400E' }}
              >
                {INVITATION_LABEL[invitation.invitation_type] || invitation.invitation_type}
              </Text>
            </View>
          </View>

          {invitation.why_interested.length > 0 && (
            <Section label="Why this school is interested">
              <View className="bg-white rounded-2xl p-4" style={cardShadow}>
                {invitation.why_interested.map((w, i) => (
                  <View key={i} className={`flex-row items-start ${i > 0 ? 'mt-2.5' : ''}`}>
                    <Ionicons name="checkmark" size={16} color="#0F2A45" style={{ marginTop: 2 }} />
                    <Text className="flex-1 ml-2 text-sm text-slate-800 leading-relaxed">{w}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {!!invitation.message && (
            <Section label="Message from the school">
              <View className="bg-white rounded-2xl p-4" style={cardShadow}>
                <Text className="text-sm text-slate-800 leading-relaxed">{invitation.message}</Text>
              </View>
            </Section>
          )}

          {/* Contact details — visible only after acceptance */}
          {accepted && (invitation.institution.contact_email || invitation.institution.contact_phone || invitation.institution.website) && (
            <Section label="Contact this school">
              {invitation.institution.contact_email && (
                <ContactRow
                  icon="mail-outline"
                  text={invitation.institution.contact_email}
                  onPress={() => Linking.openURL(`mailto:${invitation.institution.contact_email}`)}
                />
              )}
              {invitation.institution.contact_phone && (
                <ContactRow
                  icon="call-outline"
                  text={invitation.institution.contact_phone}
                  onPress={() => Linking.openURL(`tel:${invitation.institution.contact_phone}`)}
                />
              )}
              {invitation.institution.website && (
                <ContactRow
                  icon="globe-outline"
                  text={invitation.institution.website}
                  onPress={() => Linking.openURL(invitation.institution.website!)}
                />
              )}
            </Section>
          )}

          {/* Trust + sharing footer */}
          <View className="px-5 mt-7 mb-2">
            <View className="bg-slate-50 rounded-2xl p-4">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Sharing level
              </Text>
              <Text className="text-xs text-slate-700 leading-relaxed">
                The school requested visibility at the
                {' '}<Text className="font-bold">{invitation.requested_share_level.replace(/_/g, ' ')}</Text>{' '}
                level. They only see your child's anonymised profile until you approve a separate
                Passport-access request.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky CTAs */}
        <View className="absolute left-0 right-0 bottom-0 px-6 pb-6 flex-row" style={{ gap: 8 }}>
          {accepted ? (
            <Pressable
              onPress={() => router.replace('/(parent)/applications' as any)}
              className="flex-1 py-3 rounded-full items-center bg-maple-900"
            >
              <Text className="text-sm font-bold text-white">Track in applications</Text>
            </Pressable>
          ) : declined ? (
            <Pressable
              onPress={() => router.back()}
              className="flex-1 py-3 rounded-full items-center"
              style={{ backgroundColor: '#F1F5F9' }}
            >
              <Text className="text-sm font-bold text-slate-700">Back</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={onDecline}
                disabled={submitting}
                className="flex-1 py-3 rounded-full items-center"
                style={{ backgroundColor: '#F1F5F9' }}
              >
                <Text className="text-sm font-bold text-slate-700">Decline</Text>
              </Pressable>
              <Pressable
                onPress={onAccept}
                disabled={submitting}
                className="flex-[2] py-3 rounded-full items-center bg-maple-900"
              >
                <Text className="text-sm font-bold text-white">
                  {submitting ? 'Working…' : 'Accept invitation'}
                </Text>
              </Pressable>
            </>
          )}
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

const ContactRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
}> = ({ icon, text, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="link"
    accessibilityLabel={text}
    className="bg-white rounded-2xl p-3 mb-2 flex-row items-center"
    style={cardShadow}
  >
    <Ionicons name={icon} size={16} color="#475569" />
    <Text className="text-sm text-slate-700 ml-2 flex-1">{text}</Text>
    <Ionicons name="open-outline" size={14} color="#94A3B8" />
  </Pressable>
);
