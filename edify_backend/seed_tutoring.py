import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from tutoring.models import TutorProfile, TutoringBounty, PeerPointsLedger
from live_sessions.models import LiveSession, MissedSessionRecovery, RecoveryAssignment
from lessons.models import Lesson
from curriculum.models import Subject

User = get_user_model()

def seed_data():
    print("Seeding Peer Tutoring Hub and Session Recovery data...")

    # 1. Ensure we have some subjects
    math_subject, _ = Subject.objects.get_or_create(name='Mathematics', defaults={'code': 'MTH'})
    physics_subject, _ = Subject.objects.get_or_create(name='Physics', defaults={'code': 'PHY'})
    eng_subject, _ = Subject.objects.get_or_create(name='English Literature', defaults={'code': 'ENG'})

    # 2. Get or create some users
    martin, _ = User.objects.get_or_create(email='martin.tutor@example.com', defaults={'full_name': 'Martin K.', 'role': 'student', 'country_code': 'UG'})
    juliet, _ = User.objects.get_or_create(email='juliet.tutor@example.com', defaults={'full_name': 'Juliet N.', 'role': 'student', 'country_code': 'UG'})
    sarah, _ = User.objects.get_or_create(email='sarah.student@example.com', defaults={'full_name': 'Sarah Namubiru', 'role': 'student', 'country_code': 'UG'})
    david, _ = User.objects.get_or_create(email='david.student@example.com', defaults={'full_name': 'David Lwanga', 'role': 'student', 'country_code': 'UG'})
    main_student, _ = User.objects.get_or_create(email='student@example.com', defaults={'full_name': 'Demo Student', 'role': 'student', 'country_code': 'UG'})

    # 3. Create Tutor Profiles
    t1, _ = TutorProfile.objects.get_or_create(user=martin, defaults={
        'bio': 'I topped the S4 Mock exams in Central region. I heavily specialize in organic chemistry and circular motion mechanics.',
        'rating': 4.9,
        'total_sessions': 42
    })
    t1.subjects.add(math_subject, physics_subject)

    t2, _ = TutorProfile.objects.get_or_create(user=juliet, defaults={
        'bio': 'Happy to review essays and debate NCDC literature set books. Free on weekends!',
        'rating': 4.7,
        'total_sessions': 18
    })
    t2.subjects.add(eng_subject)

    # 4. Create Peer Points Ledger for current student
    PeerPointsLedger.objects.get_or_create(student=main_student, defaults={'points_earned': 120})

    # 5. Create Bounties (Open Requests)
    TutoringBounty.objects.get_or_create(
        requester=sarah, topic='Quadratic Equations', subject_name='S3 Mathematics',
        defaults={'urgency': 'high', 'points_reward': 50, 'bounty_type': 'community'}
    )
    TutoringBounty.objects.get_or_create(
        requester=david, topic='Circular Motion', subject_name='S4 Physics',
        defaults={'urgency': 'medium', 'points_reward': 30, 'bounty_type': 'community'}
    )

    # Teacher directed bounty
    TutoringBounty.objects.get_or_create(
        requester=User.objects.filter(role='teacher').first() or martin, 
        topic='Calculus: Limits & Continuity', subject_name='A-Level Math',
        defaults={
            'urgency': 'high', 'points_reward': 150, 'bounty_type': 'teacher_directed',
            'assigned_teacher_name': 'Mr. Sekabira', 'assigned_student_count': 14
        }
    )

    # 6. Missed Session Recovery
    lesson = Lesson.objects.first()
    if lesson:
        live_sess, _ = LiveSession.objects.get_or_create(
            lesson=lesson,
            defaults={'meeting_link': 'https://meet.google.com/mock', 'duration_minutes': 45}
        )
        
        recovery, _ = MissedSessionRecovery.objects.get_or_create(
            session=live_sess, student=main_student,
            defaults={
                'summary': 'We covered constant acceleration formulas and solved three practical problems. The key takeaway was properly structuring your variables before attempting the equation.',
                'recovery_status': 'pending'
            }
        )
        
        RecoveryAssignment.objects.get_or_create(
            recovery=recovery, title='Kinematics Practice Sheet',
            defaults={'file_type': 'PDF'}
        )
        print(f"Created recovery for session ID: {live_sess.id}")

    print("Seeding complete!")

if __name__ == '__main__':
    seed_data()
