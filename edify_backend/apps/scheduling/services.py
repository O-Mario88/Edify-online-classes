import datetime
from django.db.models import Q
from typing import Tuple, List, Optional
from scheduling.models import TimetableSlot, TimetableConflict, AcademicTerm, Room
from institutions.models import Institution
from classes.models import Class
from django.contrib.auth import get_user_model

def is_time_overlapping(start1: datetime.time, end1: datetime.time, start2: datetime.time, end2: datetime.time) -> bool:
    return max(start1, start2) < min(end1, end2)

class TimetableStudioService:
    @staticmethod
    def check_collisions(slot: TimetableSlot) -> Tuple[bool, List[str]]:
        """
        Hard collision prevention.
        Returns (has_collision, list_of_error_messages)
        """
        conflicts = []
        
        # Base query for slots on the exact same day in the same term
        base_qs = TimetableSlot.objects.filter(
            term_id=slot.term_id,
            day_of_week=slot.day_of_week,
        ).exclude(id=slot.id) # Don't collide with yourself
        
        # Get all slots that overlap in time
        overlapping_slots = []
        for other in base_qs:
            if is_time_overlapping(slot.start_time, slot.end_time, other.start_time, other.end_time):
                overlapping_slots.append(other)
                
        if not overlapping_slots:
            return False, conflicts
            
        for overlap in overlapping_slots:
            # 1. Teacher Collision
            if slot.teacher_id and overlap.teacher_id == slot.teacher_id:
                conflicts.append(f"Teacher already assigned in this period ({overlap.assigned_class.title}).")
                
            # 2. Class Collision
            if slot.assigned_class_id == overlap.assigned_class_id:
                conflicts.append(f"Class already has a lesson in this period ({overlap.subject.name if overlap.subject else 'another subject'}).")
                
            # 3. Room Collision
            if slot.room_id and overlap.room_id == slot.room_id:
                conflicts.append(f"Room already occupied in this time slot by {overlap.assigned_class.title}.")
                
        return len(conflicts) > 0, conflicts

    @staticmethod
    def auto_allocate_class_subjects(term: AcademicTerm, draft_mode: bool = True) -> int:
        """
        Assisted heuristic auto-allocator.
        Generates non-colliding draft timetable slots iterating through classes and required subjects.
        Returns number of slots created.
        """
        User = get_user_model()
        classes = Class.objects.filter(institution=term.institution)
        
        # Standard lesson hours
        days = [0, 1, 2, 3, 4] # Mon-Fri
        periods = [
            (datetime.time(8, 0), datetime.time(9, 0)),
            (datetime.time(9, 0), datetime.time(10, 0)),
            (datetime.time(10, 30), datetime.time(11, 30)),
            (datetime.time(11, 30), datetime.time(12, 30)),
            (datetime.time(14, 0), datetime.time(15, 0)),
            (datetime.time(15, 0), datetime.time(16, 0))
        ]
        
        slots_created = 0
        
        for cls in classes:
            from institutions.models import InstitutionSubject
            # Just grab some active subjects for demonstration
            active_subjects = [s.subject for s in InstitutionSubject.objects.filter(institution=term.institution)]
            
            # Simple heuristic allocation
            for subject in active_subjects[:5]: # Cap subjects per class for demo
                # Find an empty slot
                assigned = False
                for day in days:
                    if assigned: break
                    for start_time, end_time in periods:
                        if assigned: break
                        
                        # Try to build a slot
                        temp_slot = TimetableSlot(
                            institution=term.institution,
                            term=term,
                            assigned_class=cls,
                            subject=subject,
                            room=None, # Auto allocator doesn't assign rooms strictly without complex constraints
                            teacher=cls.teacher, # Map class teacher default
                            day_of_week=day,
                            start_time=start_time,
                            end_time=end_time,
                            is_draft=draft_mode
                        )
                        
                        has_col, _ = TimetableStudioService.check_collisions(temp_slot)
                        if not has_col:
                            temp_slot.save()
                            slots_created += 1
                            assigned = True

        return slots_created
