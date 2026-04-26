import React from 'react';
import { View, Text } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';

/**
 * Messages tab — placeholder for Phase 7 when full parent ↔ teacher
 * messaging lands (the spec calls for it explicitly: message teacher,
 * view replies, view system alerts, support threads). The honest
 * empty state tells parents the feature is coming and points them at
 * the existing /support route in the meantime.
 */
export default function ParentMessages() {
  return (
    <AppScreen>
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Inbox</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Messages</Text>
        <Text className="text-sm text-slate-600 mt-1">Talk to teachers, see school alerts, follow up on support.</Text>
      </View>
      <View className="px-5">
        <AppCard>
          <EmptyState
            title="Messaging is coming soon"
            message="Full parent ↔ teacher messaging lands with the next update. For now, urgent questions can go to support@maple.edify."
          />
        </AppCard>
      </View>
    </AppScreen>
  );
}
