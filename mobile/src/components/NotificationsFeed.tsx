import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { notificationsApi, type NotificationListItem, type NotificationsListPayload } from '@/api/notifications.api';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Channel → glyph + tint mapping. Channels are server-defined and grow
 * over time; unknown ones fall back to a generic bell.
 */
const CHANNEL_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string }> = {
  live_session_reminder: { icon: 'videocam-outline',         bg: palette.indigo[50],  fg: palette.indigo[700] },
  grading_completed:     { icon: 'document-text-outline',    bg: palette.emerald[50], fg: palette.emerald[800] },
  grading_pending:       { icon: 'document-text-outline',    bg: palette.amber[50],   fg: palette.amber[800]   },
  weekly_brief:          { icon: 'mail-open-outline',        bg: palette.indigo[50],  fg: palette.indigo[700] },
  risk_alert:            { icon: 'warning-outline',          bg: palette.rose[50],    fg: palette.rose[800]   },
  invitation:            { icon: 'paper-plane-outline',      bg: palette.amber[50],   fg: palette.amber[800]  },
  application_status:    { icon: 'business-outline',         bg: palette.indigo[50],  fg: palette.indigo[700] },
  payment_status:        { icon: 'cash-outline',             bg: palette.emerald[50], fg: palette.emerald[800] },
  payout:                { icon: 'cash-outline',             bg: palette.emerald[50], fg: palette.emerald[800] },
  message:               { icon: 'chatbubble-outline',       bg: palette.navy[100],   fg: palette.navy[900]   },
  announcement:          { icon: 'megaphone-outline',        bg: palette.amber[50],   fg: palette.amber[800]  },
};

const fallbackMeta = { icon: 'notifications-outline' as const, bg: palette.slate[100], fg: palette.slate[700] };

const titleFor = (n: NotificationListItem): string => {
  const p = n.payload || {};
  return p.title || p.subject || n.channel.replace(/_/g, ' ');
};

const bodyFor = (n: NotificationListItem): string => {
  const p = n.payload || {};
  return p.body || p.message || p.summary || '';
};

const whenLabel = (iso: string): string => {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h ago`;
    return d.toLocaleDateString();
  } catch {
    return '';
  }
};

interface Props {
  /** Optional eyebrow shown above the feed header. */
  eyebrow?: string;
  /** Optional title (defaults to "Notifications"). */
  title?: string;
  /** Empty-state title + body when no notifications exist. */
  emptyTitle?: string;
  emptyBody?: string;
}

/**
 * Reusable notifications feed for parent / teacher / institution
 * surfaces. Reads /mobile/notifications/, supports pull-to-refresh, and
 * marks visible items read once the user has dismissed the screen.
 */
export const NotificationsFeed: React.FC<Props> = ({
  eyebrow = 'Notifications',
  title = "What's new",
  emptyTitle = 'All quiet',
  emptyBody = "You're up to date. New activity will land here as it happens.",
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const query = useApiQuery<NotificationsListPayload>(
    ['mobile-notifications'],
    () => notificationsApi.list(),
    { staleTime: 30_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const onMarkAllRead = async () => {
    const unread = (query.data?.notifications || []).filter((n) => !n.read_at).map((n) => n.id);
    if (unread.length === 0) return;
    await notificationsApi.markRead(unread);
    await query.refetch();
  };

  const items = query.data?.notifications ?? [];
  const unread = query.data?.unread_count ?? 0;

  return (
    <View>
      <View style={{ paddingHorizontal: 20, paddingTop: 18, flexDirection: 'row', alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {unread === 0 ? 'No unread notifications.' : `${unread} unread.`}
          </Text>
        </View>
        {unread > 0 && (
          <Pressable
            onPress={onMarkAllRead}
            accessibilityRole="button"
            accessibilityLabel="Mark all read"
            style={{ paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, color: colors.brand.primary, letterSpacing: 0.5 }}>
              MARK ALL READ
            </Text>
          </Pressable>
        )}
      </View>

      {query.isLoading && items.length === 0 ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyBody} />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          {items.map((n) => (
            <NotificationRow key={String(n.id)} item={n} onRefresh={onRefresh} />
          ))}
        </View>
      )}
    </View>
  );
};

const NotificationRow: React.FC<{ item: NotificationListItem; onRefresh: () => void }> = ({ item, onRefresh }) => {
  const meta = CHANNEL_META[item.channel] || fallbackMeta;
  const isUnread = !item.read_at;
  const onPress = async () => {
    if (isUnread) {
      await notificationsApi.markRead([item.id]);
      onRefresh();
    }
  };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titleFor(item)}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface.raised,
          borderRadius: radius.card,
          padding: 14,
          flexDirection: 'row',
          opacity: pressed ? 0.92 : 1,
          ...shadows.xs,
        },
        isUnread && { borderLeftWidth: 3, borderLeftColor: colors.brand.primary },
      ]}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: meta.bg, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        <Ionicons name={meta.icon} size={18} color={meta.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
          {titleFor(item)}
        </Text>
        {!!bodyFor(item) && (
          <Text style={{ fontSize: fontSize.xs, color: colors.text.body, marginTop: 4, lineHeight: fontSize.xs * 1.55 }}>
            {bodyFor(item)}
          </Text>
        )}
        <Text style={{ fontSize: fontSize.xs - 1, color: colors.text.muted, marginTop: 4 }}>
          {whenLabel(item.created_at)}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
