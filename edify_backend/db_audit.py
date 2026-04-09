#!/usr/bin/env python3
import os, sys, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'edify_core.settings'
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from curriculum.models import Country, CurriculumTrack, EducationLevel, ClassLevel, Subject, Topic
from institutions.models import Institution, InstitutionMembership, InstitutionSubject
from classes.models import Class, ClassEnrollment
from scheduling.models import AcademicTerm, Room, TimetableSlot
from attendance.models import DailyRegister
from assessments.models import Assessment, Question, Submission
from lessons.models import Lesson, LessonNote
from resources.models import Resource
from analytics.models import DailyPlatformMetric, DailyInstitutionMetric, SubjectPerformanceSnapshot, TeacherPerformanceSnapshot
from marketplace.models import Listing, Wallet

User = get_user_model()

try:
    from intelligence.models import InstitutionHealthSnapshot, NextBestAction
    intel = True
except ImportError:
    intel = False

rows = [
    ("Users", User.objects.count()),
    ("Countries", Country.objects.count()),
    ("Curriculum Tracks", CurriculumTrack.objects.count()),
    ("Education Levels", EducationLevel.objects.count()),
    ("Class Levels", ClassLevel.objects.count()),
    ("Subjects", Subject.objects.count()),
    ("Topics", Topic.objects.count()),
    None,
    ("Institutions", Institution.objects.count()),
    ("Memberships", InstitutionMembership.objects.count()),
    ("Institution Subjects", InstitutionSubject.objects.count()),
    None,
    ("Classes", Class.objects.count()),
    ("Enrollments", ClassEnrollment.objects.count()),
    None,
    ("Academic Terms", AcademicTerm.objects.count()),
    ("Rooms", Room.objects.count()),
    ("Timetable Slots", TimetableSlot.objects.count()),
    None,
    ("Lessons", Lesson.objects.count()),
    ("Lesson Notes", LessonNote.objects.count()),
    None,
    ("Assessments", Assessment.objects.count()),
    ("Questions", Question.objects.count()),
    ("Submissions", Submission.objects.count()),
    None,
    ("Attendance Records", DailyRegister.objects.count()),
    None,
    ("Resources", Resource.objects.count()),
    ("Marketplace Listings", Listing.objects.count()),
    ("Wallets", Wallet.objects.count()),
    None,
    ("Platform Metrics", DailyPlatformMetric.objects.count()),
    ("Institution Metrics", DailyInstitutionMetric.objects.count()),
    ("Student Perf Snapshots", SubjectPerformanceSnapshot.objects.count()),
    ("Teacher Perf Snapshots", TeacherPerformanceSnapshot.objects.count()),
]
if intel:
    rows.append(("Health Snapshots", InstitutionHealthSnapshot.objects.count()))
    rows.append(("Next Best Actions", NextBestAction.objects.count()))

print("=" * 50)
print("  DATABASE SUMMARY")
print("=" * 50)
for r in rows:
    if r is None:
        print("  " + "-" * 44)
    else:
        print("  %-26s %8s" % (r[0], "{:,}".format(r[1])))
print("=" * 50)

print("\n  SCHOOLS:")
for inst in Institution.objects.all().order_by("name"):
    m = InstitutionMembership.objects.filter(institution=inst).count()
    c = Class.objects.filter(institution=inst).count()
    print("    %s: %d members, %d classes" % (inst.name, m, c))
