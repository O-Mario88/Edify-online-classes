import React from 'react';
import { AppScreen } from '@/components/AppScreen';
import { NotificationsFeed } from '@/components/NotificationsFeed';

export default function ParentNotifications() {
  return (
    <AppScreen>
      <NotificationsFeed
        emptyTitle="No new updates"
        emptyBody="Weekly briefs, teacher messages, and school announcements will land here."
      />
    </AppScreen>
  );
}
