import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileHeaderProps {
  greeting?: string;
  name: string;
  /** Subtitle slot — class code ("S3 East · 2025") or relationship label. */
  subtitle?: string;
  unreadCount?: number;
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
}

/**
 * Premium-minimal Maple header. Off-white canvas, dark-grey text,
 * thin-line icons, soft monochrome avatar disc with initials. The
 * panel uses no bold colour — saturation lives downstream in the
 * subject palette so the header always reads as calm chrome rather
 * than a competing surface.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  greeting = 'Good day',
  name,
  subtitle,
  unreadCount = 0,
  onSearchPress,
  onNotificationsPress,
}) => {
  const initials = (name || '?')
    .split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <View className="px-5 pt-2 pb-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 min-w-0">
          <View
            className="w-12 h-12 rounded-full bg-white items-center justify-center"
            style={{
              elevation: 1,
              shadowColor: '#0F172A',
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text className="text-slate-800 text-base font-bold">{initials}</Text>
          </View>
          <View className="ml-3 flex-1 min-w-0">
            <Text className="text-[11px] font-medium text-slate-500">{greeting}</Text>
            <Text numberOfLines={1} className="text-slate-900 text-lg font-bold mt-0.5">{name}</Text>
            {!!subtitle && (
              <Text numberOfLines={1} className="text-slate-500 text-xs font-medium mt-0.5">{subtitle}</Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-2 ml-3">
          <IconButton onPress={onSearchPress} accessibilityLabel="Search">
            <Ionicons name="search-outline" size={20} color="#334155" />
          </IconButton>
          <IconButton onPress={onNotificationsPress} accessibilityLabel="Notifications" badge={unreadCount}>
            <Ionicons name="notifications-outline" size={20} color="#334155" />
          </IconButton>
        </View>
      </View>
    </View>
  );
};

const IconButton: React.FC<React.PropsWithChildren<{
  onPress?: () => void;
  accessibilityLabel: string;
  badge?: number;
}>> = ({ children, onPress, accessibilityLabel, badge = 0 }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={badge > 0 ? `${accessibilityLabel} (${badge} new)` : accessibilityLabel}
    className="w-10 h-10 rounded-full bg-white items-center justify-center relative"
    style={{
      elevation: 1,
      shadowColor: '#0F172A',
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    }}
  >
    {children}
    {badge > 0 && (
      <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 px-1 items-center justify-center">
        <Text className="text-[10px] font-bold text-white">{badge > 9 ? '9+' : badge}</Text>
      </View>
    )}
  </Pressable>
);
