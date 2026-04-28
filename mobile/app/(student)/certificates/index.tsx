import React, { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { passportApi, type Credential } from '@/api/learning.api';
import { shareItem } from '@/hooks/useShare';

const KIND_TINT: Record<string, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  certificate: { bg: '#FFEDD5', fg: '#9A3412', icon: 'medal-outline' },
  badge:       { bg: '#FEF3C7', fg: '#92400E', icon: 'ribbon-outline' },
  project:     { bg: '#FFE4E6', fg: '#9F1239', icon: 'construct-outline' },
};

/**
 * Certificates — every credential the learner has earned, with verify
 * codes and a one-tap share. Tapping verify opens the public verify
 * URL in a browser; share posts a short message + verify URL to
 * WhatsApp / OS share sheet.
 */
export default function CertificatesScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const query = useApiQuery<Credential[]>(
    ['credentials'],
    () => passportApi.myCredentials(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Credentials</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Certificates</Text>
        <Text className="text-sm text-slate-600 mt-1">
          School-issued credentials. Each carries a QR-verifiable code.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : items.length === 0 ? (
        <View className="px-5">
          <EmptyState
            title="No certificates yet"
            message="Complete a Mastery Track or pass a milestone to earn your first credential."
          />
        </View>
      ) : (
        <View className="px-5">
          {items.map((c) => <CredentialCard key={String(c.id)} c={c} />)}
        </View>
      )}
    </AppScreen>
  );
}

const cardShadow = {
  elevation: 2,
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
} as const;

const CredentialCard: React.FC<{ c: Credential }> = ({ c }) => {
  const tint = KIND_TINT[c.kind] || KIND_TINT.certificate;
  return (
    <View className="bg-white rounded-3xl p-5 mb-3" style={cardShadow}>
      <View className="flex-row items-start">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: tint.bg }}
        >
          <Ionicons name={tint.icon} size={22} color={tint.fg} />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tint.fg }}>
            {c.kind}
            {c.subject ? ` · ${c.subject}` : ''}
          </Text>
          <Text className="text-base font-extrabold text-slate-900 mt-0.5">{c.title}</Text>
          <Text className="text-[11px] text-slate-500 mt-0.5">
            Issued {new Date(c.issued_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {(c.verify_code || c.verify_url) && (
        <View className="mt-4 pt-3 border-t border-slate-100 flex-row" style={{ gap: 8 }}>
          {c.verify_url && (
            <Pressable
              onPress={() => Linking.openURL(c.verify_url!).catch(() => {})}
              accessibilityRole="button"
              accessibilityLabel="Open verification page"
              className="flex-1 py-2.5 rounded-full items-center"
              style={{ backgroundColor: '#F1F5F9' }}
            >
              <Text className="text-xs font-bold text-slate-700">Verify</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() =>
              shareItem({
                title: c.title,
                message: `I just earned ${c.title} at Maple Online School.${c.verify_code ? ` Verify code: ${c.verify_code}` : ''}`,
                url: c.verify_url,
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Share certificate via WhatsApp"
            className="flex-1 py-2.5 rounded-full flex-row items-center justify-center"
            style={{ backgroundColor: '#25D366' }}
          >
            <Ionicons name="logo-whatsapp" size={14} color="#FFFFFF" />
            <Text className="text-xs font-bold text-white ml-1.5">Share</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};
