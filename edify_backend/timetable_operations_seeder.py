import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edify_core.settings')
django.setup()

import datetime
from django.utils import timezone
import random
from institutions.models import Institution
from classes.models import Class
from scheduling.models import AcademicTerm, Room, TimetableSlot, TimetableConflict
from curriculum.models import ClassLevel, Subject, Topic
from lessons.models import LessonInstance, LessonVerificationRecord
from assessments.models import Assessment
from accounts.models import User

def get_or_create_base_data():
    institution, _ = Institution.objects.get_or_create(
        name="Maple Online School Beta",
        defaults={'slug': 'maple-beta'}
    )
    
    term, _ = AcademicTerm.objects.get_or_create(
        institution=institution,
        name="Term 1 2026",
        defaults={'start_date': datetime.date(2026, 1, 10), 'end_date': datetime.date(2026, 4, 20), 'is_active': True}
    )
    
    return institution, term

def seed_rooms(institution):
    rooms = ["Lab A", "Lab B", "Lecture Hall 1", "Room 101", "Room 102"]
    for r in rooms:
        Room.objects.get_or_create(institution=institution, name=r)

def simulate_timetable_lifecycle():
    institution, term = get_or_create_base_data()
    seed_rooms(institution)
    
    print("Base data established.")
    
    # Check subjects and classes
    subjects = list(Subject.objects.all()[:3])
    classes = list(Class.objects.filter(institution=institution)[:2])
    
    if not subjects or not classes:
        print("Please seed curriculum subjects and classes before running this specialized seeder.")
        return
        
    print(f"Loaded {len(subjects)} subjects and {len(classes)} classes.")

    # Generate 10 clean slots manually
    teacher = classes[0].teacher
    start_time = datetime.time(8, 0)
    end_time = datetime.time(9, 0)
    
    TimetableSlot.objects.all().delete()
    print("Cleared old timetable slots.")

    slot1 = TimetableSlot.objects.create(
        institution=institution,
        term=term,
        assigned_class=classes[0],
        subject=subjects[0],
        teacher=teacher,
        day_of_week=0,
        start_time=start_time,
        end_time=end_time,
        is_draft=False
    )
    print("Created Slot 1 (Clean)")
    
    # Generate an explicit collision (Attempting to double book the room or teacher)
    from scheduling.services import TimetableStudioService
    slot2 = TimetableSlot(
        institution=institution,
        term=term,
        assigned_class=classes[1] if len(classes)>1 else classes[0],
        subject=subjects[1] if len(subjects)>1 else subjects[0],
        teacher=teacher, # COLLISION! Same teacher, same time
        day_of_week=0,
        start_time=start_time,
        end_time=end_time,
    )
    
    has_conflict, msgs = TimetableStudioService.check_collisions(slot2)
    if has_conflict:
        print(f"Collision Caught Beautifully: {msgs}")
        TimetableConflict.objects.create(
            institution=institution, term=term,
            slot_1=slot1, slot_2=slot2, # Normally slot_2 won't save if blocked, but for audit we save it
            conflict_type='teacher', description="; ".join(msgs)
        )
    slot2.save() # Force save for demo tracking purposes
    
    # Run the Auto Allocator
    print("Running Assisted Auto-Allocator...")
    slots_created = TimetableStudioService.auto_allocate_class_subjects(term, draft_mode=True)
    print(f"Auto-Allocator drafted {slots_created} non-colliding slots.")

    # Simulate the Lesson Verification Lifecycle
    today = timezone.now().date()
    # 1. Scheduled (Nothing done)
    instance1 = LessonInstance.objects.create(timetable_slot=slot1, date=today)
    vf1 = LessonVerificationRecord.objects.create(lesson_instance=instance1, status='scheduled')
    
    # 2. Acknowledged (Teacher saw notification but hasn't started)
    instance2 = LessonInstance.objects.create(timetable_slot=TimetableSlot.objects.last(), date=today)
    vf2 = LessonVerificationRecord.objects.create(
        lesson_instance=instance2, 
        status='acknowledged',
        reminder_sent_at=timezone.now() - datetime.timedelta(minutes=15),
        acknowledged_at=timezone.now() - datetime.timedelta(minutes=10)
    )
    
    # 3. Started (Anti-abuse safe)
    instance3 = LessonInstance.objects.create(timetable_slot=TimetableSlot.objects.filter(is_draft=True).first(), date=today)
    vf3 = LessonVerificationRecord.objects.create(
        lesson_instance=instance3, 
        status='started',
        acknowledged_at=timezone.now() - datetime.timedelta(minutes=45),
        started_at=timezone.now() - datetime.timedelta(minutes=30)
    )
    
    # 4. Completed (Has assignment bound perfectly)
    from assessments.models import Assessment
    dummy_assignment, _ = Assessment.objects.get_or_create(type='assignment', max_score=100)
    
    instance4 = LessonInstance.objects.create(timetable_slot=TimetableSlot.objects.filter(is_draft=True).last(), date=today)
    vf4 = LessonVerificationRecord.objects.create(
        lesson_instance=instance4, 
        status='completed',
        started_at=timezone.now() - datetime.timedelta(hours=2),
        completed_at=timezone.now() - datetime.timedelta(minutes=10),
        linked_assignment=dummy_assignment
    )
    
    print("Verification state machine seeded successfully:")
    print(f"- {vf1}")
    print(f"- {vf2}")
    print(f"- {vf3}")
    print(f"- {vf4}")

if __name__ == '__main__':
    simulate_timetable_lifecycle()
