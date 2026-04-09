#!/usr/bin/env python3
"""Consolidate duplicate curriculum data into a single clean hierarchy."""
import os, sys, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'edify_core.settings'
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from curriculum.models import CurriculumTrack, EducationLevel, ClassLevel, Topic, SubjectCombination
from classes.models import Class

merge_map = {
    5: 21,   # S1 -> Senior 1
    6: 22,   # S2 -> Senior 2
    7: 23,   # S3 -> Senior 3
    8: 24,   # S4 -> Senior 4
    9: 25,   # S5 -> Senior 5
    10: 26,  # S6 -> Senior 6
}

print("Merging duplicate ClassLevels...")
for old_id, new_id in merge_map.items():
    old_cl = ClassLevel.objects.filter(id=old_id).first()
    new_cl = ClassLevel.objects.filter(id=new_id).first()
    if not old_cl or not new_cl:
        print(f"  Skip {old_id}->{new_id}: not found")
        continue

    moved = 0
    for topic in Topic.objects.filter(class_level=old_cl):
        if not Topic.objects.filter(class_level=new_cl, subject=topic.subject, name=topic.name).exists():
            topic.class_level = new_cl
            topic.save()
            moved += 1
        else:
            topic.delete()

    cls_moved = Class.objects.filter(class_level=old_cl).update(class_level=new_cl)

    for sc in SubjectCombination.objects.filter(class_level=old_cl):
        if not SubjectCombination.objects.filter(class_level=new_cl, subject=sc.subject).exists():
            sc.class_level = new_cl
            sc.save()
        else:
            sc.delete()

    print(f"  {old_cl.name}(id={old_id}) -> {new_cl.name}(id={new_id}): {moved} topics, {cls_moved} classes")
    old_cl.delete()

# Clean up empty levels/tracks
for el in EducationLevel.objects.all():
    if el.class_levels.count() == 0:
        print(f"  Deleting empty EducationLevel: {el.name} (id={el.id})")
        el.delete()

for track in CurriculumTrack.objects.all():
    if EducationLevel.objects.filter(track=track).count() == 0:
        print(f"  Deleting empty CurriculumTrack: {track.name} (id={track.id})")
        track.delete()

# Move Primary to main track
primary_el = EducationLevel.objects.filter(name='Primary').first()
track4 = CurriculumTrack.objects.filter(name='Uganda National Curriculum').first()
if primary_el and track4 and primary_el.track_id != track4.id:
    old_track = primary_el.track
    primary_el.track = track4
    primary_el.save()
    print(f"  Moved Primary to '{track4.name}'")
    if EducationLevel.objects.filter(track=old_track).count() == 0:
        old_track.delete()

print("\nFinal hierarchy:")
for t in CurriculumTrack.objects.all():
    print(f"  Track: {t.name}")
    for el in EducationLevel.objects.filter(track=t):
        print(f"    {el.name}:")
        for cl in el.class_levels.all():
            tc = Topic.objects.filter(class_level=cl).count()
            cc = Class.objects.filter(class_level=cl).count()
            print(f"      {cl.name} (id={cl.id}): {tc} topics, {cc} classes")
