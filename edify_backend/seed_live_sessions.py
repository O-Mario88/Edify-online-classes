#!/usr/bin/env python3
import os, sys, random
from pathlib import Path
from datetime import datetime, timedelta

sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from live_sessions.models import LiveSession
from curriculum.models import Subject

User = get_user_model()

def seed_live_sessions():
    print("Seeding Live Sessions...")
    from lessons.models import Lesson
    lessons = list(Lesson.objects.all()[:25])
    if not lessons:
        print("No lessons found.")
        return

    for lesson in lessons:
        is_past = random.random() < 0.3
        if is_past:
            start_time = timezone.now() - timedelta(days=random.randint(1, 10), hours=random.randint(1, 12))
            status = 'completed'
        else:
            start_time = timezone.now() + timedelta(days=random.randint(0, 14), hours=random.randint(1, 24))
            status = 'scheduled'
            
        LiveSession.objects.create(
            lesson=lesson,
            scheduled_start=start_time,
            duration_minutes=random.choice([45, 60, 90, 120]),
            status=status,
            meeting_link=f"https://meet.edify.africa/{random.randint(100000, 999999)}",
            replay_url=f"https://video.edify.africa/{random.randint(100000, 999999)}" if is_past else None,
            capacity=random.choice([50, 100, 500]),
            enrolled_count=random.randint(5, 50),
            provider='google_meet'
        )
    print("Done seeding 25 Live Sessions.")

if __name__ == '__main__':
    seed_live_sessions()
