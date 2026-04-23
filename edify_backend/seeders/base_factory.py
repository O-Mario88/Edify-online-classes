import os
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

def seed_base_users():
    """Generates the fundamental platform personas required for a unified demo experience."""
    logger.info("Seeding Level 1: Core System Avatars and Users")

    password = os.environ.get("SEED_PASSWORD", "DemoAccount2025!")
    profiles = [
        {"email": "super.demo@edify.ug", "full_name": "Oliver Root", "role": "admin"},
        {"email": "admin.demo@edify.ug", "full_name": "Nalwoga Admin", "role": "admin"},
        
        # Secondary Context Demo Roles
        {"email": "inst.demo@edify.ug", "full_name": "Dr. Musoke Director", "role": "institution"},
        {"email": "teacher.demo@edify.ug", "full_name": "Robert Okello", "role": "teacher"},
        {"email": "student.demo@edify.ug", "full_name": "Grace Namatovu", "role": "student"},
        {"email": "student.stellar@edify.ug", "full_name": "Mark Kintu", "role": "student"},
        {"email": "parent.demo@edify.ug", "full_name": "Mrs. Namatovu Senior", "role": "student"}, # No parent role exists in User roles choice! Let's mock it under 'student' or 'institution' for now, or maybe the model supports it? Wait, choices are [student, teacher, admin, institution]. I'll use 'institution' or just 'student'.
        
        # Primary Context Demo Roles
        {"email": "inst.primary@edify.ug", "full_name": "Mrs. Nakato Headteacher", "role": "institution"},
        {"email": "teacher.primary@edify.ug", "full_name": "Jane Aciro", "role": "teacher"},
        {"email": "student.primary@edify.ug", "full_name": "Junior Namatovu", "role": "student"},
        
        # Independent Context Demo Roles
        {"email": "teacher.independent@edify.ug", "full_name": "Simon Freelance", "role": "teacher"},
        {"email": "student.independent@edify.ug", "full_name": "Anna Solo", "role": "student"}
    ]
    
    # Bulk Secondary Students
    for i in range(1, 31):
        profiles.append({"email": f"student.sec{i}@edify.ug", "full_name": f"Sec Student {i}", "role": "student"})
        
    # Bulk Primary Students
    for i in range(1, 11):
        profiles.append({"email": f"student.pri{i}@edify.ug", "full_name": f"Pri Student {i}", "role": "student"})
        
    # Bulk Secondary Teachers
    for i in range(1, 6):
        profiles.append({"email": f"teacher.sec{i}@edify.ug", "full_name": f"Sec Teacher {i}", "role": "teacher"})
    
    created_users = {}
    for profile in profiles:
        user, created = User.objects.get_or_create(
            email=profile["email"],
            defaults={
                "full_name": profile["full_name"],
                "country_code": "UG",
                "role": profile["role"],
                "is_staff": profile["role"] == "admin",
                "is_superuser": profile["role"] == "admin"
            }
        )
        if not user.check_password(password):
            user.set_password(password)
            user.save()
            
        created_users[profile["email"]] = user
        logger.info(f" - Seeded user: {user.email}")
        
    return created_users
