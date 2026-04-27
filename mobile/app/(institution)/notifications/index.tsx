import React from 'react';
import { AppScreen } from '@/components/AppScreen';
import { NotificationsFeed } from '@/components/NotificationsFeed';

export default function InstitutionNotifications() {
  return (
    <AppScreen>
      <NotificationsFeed
        emptyTitle="All quiet"
        emptyBody="Risk alerts, new admission enquiries, and finance updates will land here."
      />
    </AppScreen>
  );
}
