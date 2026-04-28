import React from 'react';
import { AppScreen } from '@/components/AppScreen';
import { NotificationsFeed } from '@/components/NotificationsFeed';

export default function TeacherNotifications() {
  return (
    <AppScreen>
      <NotificationsFeed
        emptyTitle="Inbox zero"
        emptyBody="Class reminders, new submissions, fresh reviews, and payout alerts will land here."
      />
    </AppScreen>
  );
}
