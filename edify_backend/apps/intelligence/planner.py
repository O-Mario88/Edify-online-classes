"""
Study Planner Engine — generates weekly study plans for students
based on upcoming lessons, weak topics, incomplete assignments,
attendance gaps, and intervention packs.
"""
from django.utils import timezone
from datetime import timedelta, date
from .models import StudyPlan, StudyTask


class StudyPlannerEngine:
    """Generates and manages student study plans."""

    def generate_weekly_plan(self, student, institution=None):
        """Generate a study plan for the upcoming week."""
        now = timezone.now()
        today = now.date()

        # Week boundaries (Mon-Sun)
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday)
        week_end = week_start + timedelta(days=6)

        # Get or create plan
        plan, created = StudyPlan.objects.get_or_create(
            student=student, week_start=week_start,
            defaults={'week_end': week_end}
        )

        if not created and plan.tasks.exists():
            # Plan already exists with tasks, skip regeneration
            return plan

        tasks = []
        inputs_snapshot = {}

        # 1. Incomplete assignments → tasks
        from assessments.models import Assessment, Submission
        pending = Assessment.objects.filter(
            target_group__enrollments__student=student,
            due_date__gte=today,
            due_date__lte=week_end + timedelta(days=7),
        ).exclude(
            submissions__student=student, submissions__status='submitted'
        ).select_related('subject')[:8]

        inputs_snapshot['pending_assignments'] = pending.count()

        for a in pending:
            urgency = 'urgent' if a.due_date and (a.due_date - today).days <= 2 else 'normal'
            tasks.append(StudyTask(
                plan=plan,
                title=f"Complete: {a.title}",
                task_type='assignment',
                urgency=urgency,
                subject=a.subject if hasattr(a, 'subject') else None,
                scheduled_date=min(a.due_date - timedelta(days=1), week_end) if a.due_date else today,
                estimated_minutes=45,
                linked_assessment=a,
                reason=f"Due on {a.due_date}" if a.due_date else "Pending submission",
            ))

        # 2. Weak subjects → revision tasks
        from analytics.models import SubjectPerformanceSnapshot
        weak_subjects = SubjectPerformanceSnapshot.objects.filter(
            student=student, is_at_risk=True
        ).select_related('subject')[:4]

        inputs_snapshot['weak_subjects'] = [s.subject.name for s in weak_subjects]

        for i, snap in enumerate(weak_subjects):
            tasks.append(StudyTask(
                plan=plan,
                title=f"Revise: {snap.subject.name}",
                task_type='revision',
                urgency='urgent' if snap.exam_readiness_score < 40 else 'normal',
                subject=snap.subject,
                scheduled_date=week_start + timedelta(days=min(i + 1, 5)),
                estimated_minutes=40,
                reason=f"Readiness score: {snap.exam_readiness_score:.0f}%",
            ))

        # 3. Unfinished resources → continue tasks
        from intelligence.models import LearningProgress
        unfinished = LearningProgress.objects.filter(
            user=student, is_completed=False, progress_pct__gt=5
        ).order_by('-last_accessed_at')[:3]

        inputs_snapshot['unfinished_resources'] = unfinished.count()

        for i, lp in enumerate(unfinished):
            tasks.append(StudyTask(
                plan=plan,
                title=f"Continue {lp.content_type} ({lp.progress_pct:.0f}% done)",
                task_type='reading' if lp.content_type == 'resource' else 'video',
                urgency='normal',
                scheduled_date=week_start + timedelta(days=min(i + 2, 5)),
                estimated_minutes=25,
                reason=f"Partially completed ({lp.progress_pct:.0f}%)",
            ))

        # 4. Intervention packs → tasks
        from intelligence.models import InterventionPackAssignment
        active_packs = InterventionPackAssignment.objects.filter(
            student=student, completed_at__isnull=True
        ).select_related('pack')[:2]

        for pack_assign in active_packs:
            tasks.append(StudyTask(
                plan=plan,
                title=f"Intervention: {pack_assign.pack.title}",
                task_type='intervention',
                urgency='urgent',
                subject=pack_assign.pack.subject,
                scheduled_date=today,
                estimated_minutes=60,
                reason="Active intervention pack requires completion",
            ))

        # Save tasks and update plan totals
        if tasks:
            StudyTask.objects.bulk_create(tasks)

        plan.total_estimated_minutes = sum(t.estimated_minutes for t in tasks)
        plan.inputs_snapshot = inputs_snapshot
        plan.save()

        return plan

    def get_today_tasks(self, student):
        """Get tasks scheduled for today."""
        today = timezone.now().date()
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday)

        plan = StudyPlan.objects.filter(
            student=student, week_start=week_start
        ).first()

        if not plan:
            plan = self.generate_weekly_plan(student)

        return plan.tasks.filter(scheduled_date=today).order_by('-urgency', 'estimated_minutes')

    def mark_task_complete(self, task_id, student, actual_minutes=None):
        """Mark a study task as completed."""
        task = StudyTask.objects.get(id=task_id, plan__student=student)
        task.status = 'completed'
        task.completed_at = timezone.now()
        if actual_minutes:
            task.actual_minutes = actual_minutes
        task.save()

        # Update plan completed minutes
        plan = task.plan
        plan.completed_minutes = sum(
            t.actual_minutes or t.estimated_minutes
            for t in plan.tasks.filter(status='completed')
        )
        plan.save()

        return task
