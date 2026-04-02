import os
import sys
import django
import random

sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edify_core.settings")
django.setup()

from django.contrib.auth import get_user_model
from curriculum.models import Topic
from marketplace.models import Listing, ListingTopicBinding

User = get_user_model()

def seed():
    # Make sure we have a teacher
    teacher, _ = User.objects.get_or_create(email="expert@edify.ug", defaults={
        "full_name": "Expert Teacher", "role": "institution_teacher"
    })

    print("Clearing old marketplace data...")
    Listing.objects.all().delete()

    topics = list(Topic.objects.all())
    if len(topics) > 100: topics = topics[:100]
    
    print(f"Seeding marketplace resources for {len(topics)} topics...")

    for topic in topics:
        for i in range(random.randint(2, 4)):
            v_list = Listing.objects.create(
                teacher=teacher,
                title=f"Comprehensive Video: {topic.name} Part {i+1}",
                content_type="video",
                price_amount=15000,
                visibility_state="published",
                average_rating=round(random.uniform(4.2, 5.0), 1),
                review_count=random.randint(10, 200),
                student_count=random.randint(50, 1000)
            )
            ListingTopicBinding.objects.create(listing=v_list, topic=topic)

        for i in range(random.randint(1, 2)):
            n_list = Listing.objects.create(
                teacher=teacher,
                title=f"Digital Handouts: {topic.name}",
                content_type="notes",
                price_amount=5000,
                visibility_state="published",
                average_rating=round(random.uniform(4.0, 4.8), 1),
                review_count=random.randint(5, 100),
                student_count=random.randint(20, 500)
            )
            ListingTopicBinding.objects.create(listing=n_list, topic=topic)

        for i in range(random.randint(1, 2)):
            a_list = Listing.objects.create(
                teacher=teacher,
                title=f"Diagnostic Exam: {topic.name}",
                content_type="assessment",
                price_amount=10000,
                visibility_state="published",
                average_rating=round(random.uniform(4.1, 4.9), 1),
                review_count=random.randint(10, 150),
                student_count=random.randint(30, 800)
            )
            ListingTopicBinding.objects.create(listing=a_list, topic=topic)

    print("Seeding complete.")

if __name__ == '__main__':
    seed()
