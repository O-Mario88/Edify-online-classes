import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { teacherApi, type MarketplaceListing } from '@/api/teacher.api';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Teacher storefront — list of the teacher's own marketplace listings.
 * Status pill shows draft / published / archived. Edit / preview deep
 * links land in a follow-up.
 */
export default function TeacherStorefront() {
  const [refreshing, setRefreshing] = useState(false);
  const query = useApiQuery<MarketplaceListing[]>(
    ['teacher-listings'],
    () => teacherApi.myListings(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];
  const published = items.filter((l) => l.status === 'published').length;

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Storefront</Text>
        <Text style={styles.title}>Your listings</Text>
        <Text style={styles.subtitle}>
          The lessons + sessions you've published. {published} live · {items.length} total.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title="No listings yet"
          message="Publish a lesson or live session and it'll appear here. The web admin has the lesson studio."
        />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          {items.map((l) => (
            <ListingRow key={String(l.id)} listing={l} />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const STATUS_TINT: Record<string, { bg: string; fg: string }> = {
  published: { bg: palette.emerald[50],  fg: palette.emerald[800] },
  draft:     { bg: palette.amber[50],    fg: palette.amber[800]   },
  archived:  { bg: palette.slate[200],   fg: palette.slate[700]   },
};

const ListingRow: React.FC<{ listing: MarketplaceListing }> = ({ listing }) => {
  const tint = STATUS_TINT[listing.status || 'draft'] || STATUS_TINT.draft;
  return (
    <View style={{ backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 14, ...shadows.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: palette.bronze[100], alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <Ionicons name="storefront-outline" size={18} color={palette.bronze[700]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }} numberOfLines={1}>
            {listing.title}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }} numberOfLines={1}>
            {listing.subject || '—'}
            {typeof listing.price === 'number' && listing.price > 0 ? ` · ${listing.currency || ''} ${listing.price}` : ''}
            {typeof listing.enrollment_count === 'number' ? ` · ${listing.enrollment_count} learners` : ''}
            {typeof listing.rating === 'number' && listing.rating > 0 ? ` · ★ ${listing.rating.toFixed(1)}` : ''}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: tint.bg }}>
          <Text style={{ fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, color: tint.fg, letterSpacing: 0.5 }}>
            {(listing.status || 'draft').toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
