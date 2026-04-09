"""
Next Best Action Engine — generates role-aware recommendations by analyzing
attendance, assessments, resources, interventions, and engagement data.
"""
from django.utils import timezone
from django.db.models import Avg, Count, Q, F
from datetime import timedelta

from .models import NextBestAction


class NextBestActionEngine:
    """Generates prioritized next-best-actions for all roles."""

    def generate_for_student(self, student, institution=None):
        """Generate actions for a student."""
        actions = []
        now = timezone.now()

        # 1. Check incomplete assignments
        from assessments.models import Assessment, Submission
        pending_assessments = Assessment.objects.filter(
            target_group__enrollments__student=student,
            due_date__gte=now.date(),
        ).exclude(
            submissions__student=student, submissions__status='submitted'
        ).order_by('due_date')[:5]

        for a in pending_assessments:
            days_left = (a.due_date - now.date()).days if a.due_date else 7
            priority = 'critical' if days_left <= 1 else 'high' if days_left <= 3 else 'medium'
            actions.append(self._build_action(
                user=student, institution=institution,
                title=f"Complete: {a.title}",
                description=f"Due in {days_left} day(s). Submit before the deadline.",
                category='assessment', priority=priority,
                action_type='complete_assignment',
                action_url=f"/dashboard/student",
                reason=f"Assignment '{a.title}' is due in {days_left} days",
                data_inputs={'assessment_id': a.id, 'days_left': days_left},
                target_role='student',
            ))

        # 2. Check attendance gaps
        from attendance.models import DailyRegister
        recent_absences = DailyRegister.objects.filter(
            student=student, status='absent',
            date__gte=now.date() - timedelta(days=14)
        ).count()
        if recent_absences >= 2:
            actions.append(self._build_action(
                user=student, institution=institution,
                title="Improve your attendance",
                description=f"You've been absent {recent_absences} times in the last 2 weeks.",
                category='attendance', priority='high',
                action_type='improve_attendance',
                reason=f"{recent_absences} absences in 14 days",
                data_inputs={'absences_14d': recent_absences},
                target_role='student',
            ))

        # 3. Check weak subjects from performance snapshots
        from analytics.models import SubjectPerformanceSnapshot
        weak_subjects = SubjectPerformanceSnapshot.objects.filter(
            student=student, is_at_risk=True
        ).select_related('subject')[:3]

        for snap in weak_subjects:
            actions.append(self._build_action(
                user=student, institution=institution,
                title=f"Revise: {snap.subject.name}",
                description=f"Your mastery is at {snap.exam_readiness_score:.0f}%. Focused revision recommended.",
                category='academic', priority='high',
                action_type='revise_topic',
                action_url=f"/classes",
                reason=f"Subject at risk: {snap.subject.name} ({snap.exam_readiness_score:.0f}%)",
                data_inputs={'subject_id': snap.subject_id, 'readiness': float(snap.exam_readiness_score)},
                target_role='student',
            ))

        # 4. Check unfinished resources (resume-anywhere)
        from intelligence.models import LearningProgress
        unfinished = LearningProgress.objects.filter(
            user=student, is_completed=False, progress_pct__gt=10
        ).order_by('-last_accessed_at')[:3]

        for lp in unfinished:
            actions.append(self._build_action(
                user=student, institution=institution,
                title=f"Continue where you left off ({lp.progress_pct:.0f}%)",
                description=f"Resume your {lp.content_type} — you're {lp.progress_pct:.0f}% done.",
                category='resource', priority='medium',
                action_type='resume_learning',
                action_url=f"/library",
                reason=f"Unfinished {lp.content_type} at {lp.progress_pct:.0f}%",
                data_inputs={'content_type': lp.content_type, 'content_id': lp.content_id, 'progress': lp.progress_pct},
                target_role='student',
            ))

        # 5. Check upcoming live sessions
        from live_sessions.models import LiveSession
        upcoming = LiveSession.objects.filter(
            scheduled_start__gte=now,
            scheduled_start__lte=now + timedelta(hours=2),
        )[:2]

        for session in upcoming:
            mins = int((session.scheduled_start - now).total_seconds() / 60)
            actions.append(self._build_action(
                user=student, institution=institution,
                title=f"Live session in {mins} min: {session.title}",
                description="Join the upcoming live session.",
                category='engagement', priority='critical' if mins <= 15 else 'high',
                action_type='join_session',
                action_url=f"/live-sessions",
                reason=f"Session starts in {mins} minutes",
                data_inputs={'session_id': session.id, 'minutes_away': mins},
                target_role='student',
            ))

        self._save_actions(student, actions)
        return actions

    def generate_for_teacher(self, teacher, institution=None):
        """Generate actions for a teacher."""
        actions = []
        now = timezone.now()

        # 1. Students needing follow-up (at-risk)
        from interventions.models import StudentRiskAlert
        active_alerts = StudentRiskAlert.objects.filter(
            teacher=teacher, is_resolved=False
        ).order_by('-severity')[:5]

        for alert in active_alerts:
            actions.append(self._build_action(
                user=teacher, institution=institution,
                title=f"Follow up: {alert.student.full_name}",
                description=f"Risk level: {alert.severity}. {alert.auto_reason or ''}",
                category='intervention', priority='critical' if alert.severity == 'red' else 'high',
                action_type='follow_up_student',
                action_url=f"/dashboard/teacher",
                reason=f"Student at {alert.severity} risk: {alert.auto_reason}",
                data_inputs={'student_id': alert.student_id, 'severity': alert.severity},
                target_role='teacher',
            ))

        # 2. Unmarked submissions
        from assessments.models import Submission
        unmarked = Submission.objects.filter(
            assessment__created_by=teacher, status='submitted', total_score__isnull=True
        ).count()
        if unmarked > 0:
            actions.append(self._build_action(
                user=teacher, institution=institution,
                title=f"Mark {unmarked} pending submission(s)",
                description="Students are waiting for feedback on their work.",
                category='assessment', priority='high' if unmarked >= 5 else 'medium',
                action_type='mark_submissions',
                action_url=f"/dashboard/teacher",
                reason=f"{unmarked} submissions awaiting marks",
                data_inputs={'unmarked_count': unmarked},
                target_role='teacher',
            ))

        # 3. Weak topics needing reteaching
        from analytics.models import SubjectPerformanceSnapshot
        if institution:
            weak_topics = SubjectPerformanceSnapshot.objects.filter(
                institution=institution, is_at_risk=True
            ).values('subject__name').annotate(
                at_risk_count=Count('id')
            ).filter(at_risk_count__gte=3).order_by('-at_risk_count')[:3]

            for topic in weak_topics:
                actions.append(self._build_action(
                    user=teacher, institution=institution,
                    title=f"Reteach: {topic['subject__name']}",
                    description=f"{topic['at_risk_count']} students at risk in this subject.",
                    category='academic', priority='high',
                    action_type='reteach_topic',
                    reason=f"{topic['at_risk_count']} at-risk students in {topic['subject__name']}",
                    data_inputs={'subject': topic['subject__name'], 'at_risk_count': topic['at_risk_count']},
                    target_role='teacher',
                ))

        # 4. Launch intervention suggestion
        if active_alerts.count() >= 3:
            actions.append(self._build_action(
                user=teacher, institution=institution,
                title="Launch an intervention pack",
                description=f"You have {active_alerts.count()} at-risk students. Consider a targeted intervention.",
                category='intervention', priority='high',
                action_type='launch_intervention',
                action_url=f"/dashboard/teacher",
                reason=f"{active_alerts.count()} active risk alerts",
                data_inputs={'alert_count': active_alerts.count()},
                target_role='teacher',
            ))

        self._save_actions(teacher, actions)
        return actions

    def generate_for_parent(self, parent, institution=None):
        """Generate actions for a parent based on their children's data."""
        actions = []
        from parent_portal.models import ParentStudentLink

        children = ParentStudentLink.objects.filter(
            parent=parent, status='active'
        ).select_related('student')

        for link in children:
            child = link.student

            # Check child's attendance
            from attendance.models import DailyRegister
            recent_absences = DailyRegister.objects.filter(
                student=child, status='absent',
                date__gte=timezone.now().date() - timedelta(days=7)
            ).count()

            if recent_absences >= 1:
                actions.append(self._build_action(
                    user=parent, institution=institution,
                    title=f"{child.full_name} was absent {recent_absences} time(s) this week",
                    description="Please follow up with your child about attending classes.",
                    category='attendance', priority='high',
                    action_type='attendance_follow_up',
                    reason=f"{recent_absences} absences in the last 7 days",
                    data_inputs={'child_id': child.id, 'absences_7d': recent_absences},
                    target_role='parent',
                ))

            # Check incomplete assignments
            from assessments.models import Assessment, Submission
            incomplete = Assessment.objects.filter(
                target_group__enrollments__student=child,
                due_date__gte=timezone.now().date(),
            ).exclude(
                submissions__student=child
            ).count()

            if incomplete > 0:
                actions.append(self._build_action(
                    user=parent, institution=institution,
                    title=f"{child.full_name} has {incomplete} incomplete assignment(s)",
                    description="Encourage your child to complete their assignments before the deadline.",
                    category='assessment', priority='medium',
                    action_type='assignment_follow_up',
                    reason=f"{incomplete} pending assignments",
                    data_inputs={'child_id': child.id, 'incomplete_count': incomplete},
                    target_role='parent',
                ))

            # Check weak subjects
            from analytics.models import SubjectPerformanceSnapshot
            weak = SubjectPerformanceSnapshot.objects.filter(
                student=child, is_at_risk=True
            ).select_related('subject')[:2]

            for snap in weak:
                actions.append(self._build_action(
                    user=parent, institution=institution,
                    title=f"{child.full_name} needs support in {snap.subject.name}",
                    description=f"Current readiness: {snap.exam_readiness_score:.0f}%. Support at home recommended.",
                    category='academic', priority='high',
                    action_type='home_support',
                    reason=f"At-risk subject: {snap.subject.name}",
                    data_inputs={'child_id': child.id, 'subject': snap.subject.name},
                    target_role='parent',
                ))

        self._save_actions(parent, actions)
        return actions

    def generate_for_institution_admin(self, admin, institution):
        """Generate actions for an institution admin."""
        actions = []
        now = timezone.now()

        # 1. Low attendance today
        from attendance.models import DailyRegister
        today_registers = DailyRegister.objects.filter(
            institution=institution, date=now.date()
        )
        total = today_registers.count()
        absent = today_registers.filter(status='absent').count()

        if total > 0:
            rate = ((total - absent) / total) * 100
            if rate < 85:
                actions.append(self._build_action(
                    user=admin, institution=institution,
                    title=f"Attendance alert: {rate:.0f}% today",
                    description=f"{absent} students absent out of {total}.",
                    category='attendance', priority='critical' if rate < 70 else 'high',
                    action_type='review_attendance',
                    reason=f"Attendance rate {rate:.0f}% is below 85% threshold",
                    data_inputs={'rate': rate, 'absent': absent, 'total': total},
                    target_role='institution_admin',
                ))

        # 2. Low-engagement teachers
        from analytics.models import TeacherPerformanceSnapshot
        dormant_teachers = TeacherPerformanceSnapshot.objects.filter(
            institution=institution
        ).order_by('lessons_delivered')[:3]

        for t in dormant_teachers:
            if t.lessons_delivered < 3:
                actions.append(self._build_action(
                    user=admin, institution=institution,
                    title=f"Low activity: {t.teacher.full_name}",
                    description=f"Only {t.lessons_delivered} lessons delivered. Consider follow-up.",
                    category='operational', priority='medium',
                    action_type='follow_up_teacher',
                    reason=f"Teacher has delivered only {t.lessons_delivered} lessons",
                    data_inputs={'teacher_id': t.teacher_id, 'lessons': t.lessons_delivered},
                    target_role='institution_admin',
                ))

        # 3. Declining subject performance
        from analytics.models import SubjectPerformanceSnapshot
        declining = SubjectPerformanceSnapshot.objects.filter(
            institution=institution, is_at_risk=True
        ).values('subject__name').annotate(
            count=Count('id')
        ).filter(count__gte=5).order_by('-count')[:3]

        for d in declining:
            actions.append(self._build_action(
                user=admin, institution=institution,
                title=f"Subject decline: {d['subject__name']}",
                description=f"{d['count']} students at risk. Investigate and intervene.",
                category='academic', priority='high',
                action_type='investigate_subject',
                reason=f"{d['count']} at-risk students in {d['subject__name']}",
                data_inputs={'subject': d['subject__name'], 'at_risk_count': d['count']},
                target_role='institution_admin',
            ))

        self._save_actions(admin, actions)
        return actions

    def _build_action(self, user, institution=None, **kwargs):
        """Build a NextBestAction instance (not yet saved)."""
        return NextBestAction(
            user=user,
            institution=institution,
            **kwargs,
        )

    def _save_actions(self, user, actions):
        """Clear stale pending actions and bulk create new ones."""
        # Expire old pending actions
        NextBestAction.objects.filter(
            user=user, status='pending',
            created_at__lt=timezone.now() - timedelta(days=1)
        ).update(status='expired')

        # Bulk create new actions
        if actions:
            NextBestAction.objects.bulk_create(actions, ignore_conflicts=True)
