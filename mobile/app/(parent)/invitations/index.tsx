import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { schoolMatchApi, type ParentInvitation } from '@/api/schoolMatch.api';

const INVITATION_LABEL: Record<string, string> = {
  apply: 'Invite to apply',
  interview: 'Invite for interview',
  entrance_assessment: 'Entrance assessment',
  school_visit: 'School visit',
  preview_class: 'Preview class',
  scholarship: 'Scholarship offer',
  boarding_admission: 'Boarding admission',
  passport_access_request: 'Passport access',
  information_request: 'Information request',
};

const STATUS_TINT: Record<string, { bg: string; fg: string }> = {
  sent:                  { bg: '#FEF3C7', fg: '#92400E' },
  viewed:                { bg: '#FEF3C7', fg: '#92400E' },
  accepted:              { bg: '#D1FAE5', fg: '#065F46' },
  declined:              { bg: '#E2E8F0', fg: '#475569' },
  expired:               { bg: '#E2E8F0', fg: '#475569' },
  application_started:   { bg: '#E0E7FF', fg: '#3730A3' },
  application_submitted: { bg: '#E0E7FF', fg: '#3730A3' },
  interview_scheduled:   { bg: '#E0E7FF', fg: '#3730A3' },
  offer_made:            { bg: '#FFEDD5', fg: '#9A3412' },
  enrolled:              { bg: '#D1FAE5', fg: '#065F46' },
};

/**
 * Parent invitations inbox. Lists every school-match invitation
 * routed to this parent — split into "Awaiting reply" vs everything
 * else so the work-to-do stays visible.
 */
export default function ParentInvitationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const query = useApiQuery<{ count: number; invitations: ParentInvitation[] }>(
    ['parent-school-match-invitations'],
    () => schoolMatchApi.listInvitations(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data?.invitations ?? [];
  const awaiting = items.filter((i) => i.status === 'sent' || i.status === 'viewed');
  const replied = items.filter((i) => !(i.status === 'sent' || i.status === 'viewed'));

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">School Match</Text>
        <Text className="text-2xl font-extrabold text-slate-900">School invitations</Text>
        <Text className="text-sm text-slate-600 mt-1 leading-relaxed">
          Schools that found your child anonymised through Maple and want to talk. Open an
          invitation to see the why and decide.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : items.length === 0 ? (
        <View className="px-5">
          <EmptyState
            title="No invitations yet"
            message="When a verified school invites your child, you'll see it here. They can't reach out until you've opted in on the preferences screen."
          />
          <View className="mt-4">
            <Pressable
              onPress={() => router.push('/(parent)/school-match/preferences' as any)}
              className="rounded-3xl p-4 flex-row items-center"
              style={{ backgroundColor: '#FFEDD5' }}
            >
              <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3">
                <Ionicons name="business-outline" size={22} color="#9A3412" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-orange-900">Manage opportunities</Text>
                <Text className="text-xs text-orange-800 mt-0.5">
                  Choose what schools can see and when they can reach out.
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#9A3412" />
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="px-5">
          {awaiting.length > 0 && (
            <Section label={`Awaiting your reply · ${awaiting.length}`}>
              {awaiting.map((i) => (
                <InvitationCard
                  key={i.id}
                  invitation={i}
                  onPress={() => router.push(`/(parent)/invitations/${i.id}` as any)}
                />
              ))}
            </Section>
          )}
          {replied.length > 0 && (
            <Section label={`History · ${replied.length}`}>
              {replied.map((i) => (
                <InvitationCard
                  key={i.id}
                  invitation={i}
                  onPress={() => router.push(`/(parent)/invitations/${i.id}` as any)}
                />
              ))}
            </Section>
          )}
        </View>
      )}
    </AppScreen>
  );
}

const Section: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
  <View className="mb-5">
    <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">{label}</Text>
    {children}
  </View>
);

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

const InvitationCard: React.FC<{ invitation: ParentInvitation; onPress?: () => void }> = ({ invitation, onPress }) => {
  const tint = STATUS_TINT[invitation.status] || STATUS_TINT.sent;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Invitation from ${invitation.institution.name}`}
      className="bg-white rounded-2xl p-4 mb-3"
      style={cardShadow}
    >
      <View className="flex-row items-center mb-1.5">
        <View className="w-11 h-11 rounded-2xl bg-slate-100 items-center justify-center mr-3">
          <Ionicons name="business-outline" size={20} color="#0F2A45" />
        </View>
        <View className="flex-1 pr-2">
          <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">
            {invitation.institution.name}
          </Text>
          <Text className="text-[11px] text-slate-500 mt-0.5">
            {INVITATION_LABEL[invitation.invitation_type] || invitation.invitation_type}
            {' · '}
            {new Date(invitation.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: tint.bg }}>
          <Text className="text-[10px] font-bold" style={{ color: tint.fg }}>
            {invitation.status.replace(/_/g, ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      {invitation.why_interested.length > 0 && (
        <View className="flex-row flex-wrap mt-2" style={{ gap: 4 }}>
          {invitation.why_interested.slice(0, 3).map((w, i) => (
            <View key={i} className="px-2 py-0.5 rounded-full bg-emerald-50">
              <Text numberOfLines={1} className="text-[10px] font-semibold text-emerald-800">{w}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
};
