"""
Story Card Generator — translates analytics and events into
human-readable narrative insight cards for each role.
"""
from django.utils import timezone
from django.db.models import Avg, Count, F, Q
from datetime import timedelta

from .models import StoryCard


class StoryCardGenerator:
    """Generates narrative insight cards from analytics data."""

    def generate_for_student(self, student, institution=None):
        """Generate story cards for a student."""
        cards = []
        now = timezone.now()

        # 1. Streak celebration
        from intelligence.models import StudentPassport
        passport = StudentPassport.objects.filter(student=student).first()
        if passport and passport.current_streak_days >= 7:
            cards.append(self._build_card(
                audience='student', user=student, institution=institution,
                headline=f"🔥 {passport.current_streak_days}-Day Streak!",
                body=f"You've been active for {passport.current_streak_days} days straight. "
                     f"Your longest streak is {passport.longest_streak_days} days. Keep going!",
                tone='celebration',
                data_sources=['StudentPassport.current_streak_days'],
            ))

        # 2. Improvement story
        from analytics.models import SubjectPerformanceSnapshot
        improving = SubjectPerformanceSnapshot.objects.filter(
            student=student
        ).select_related('subject')

        for snap in improving[:3]:
            if hasattr(snap, 'exam_readiness_score') and snap.exam_readiness_score > 70:
                cards.append(self._build_card(
                    audience='student', user=student, institution=institution,
                    headline=f"Strong in {snap.subject.name}!",
                    body=f"Your readiness score in {snap.subject.name} is {snap.exam_readiness_score:.0f}%. "
                         f"You're well-prepared. Consider helping peers who need support.",
                    tone='positive',
                    data_sources=['SubjectPerformanceSnapshot'],
                    related_subject=snap.subject,
                ))

        # 3. At-risk warning
        weak = SubjectPerformanceSnapshot.objects.filter(
            student=student, is_at_risk=True
        ).select_related('subject')[:2]

        for snap in weak:
            cards.append(self._build_card(
                audience='student', user=student, institution=institution,
                headline=f"{snap.subject.name} Needs Attention",
                body=f"Your readiness in {snap.subject.name} is at {snap.exam_readiness_score:.0f}%. "
                     f"Check your study plan for focused revision tasks.",
                tone='warning',
                data_sources=['SubjectPerformanceSnapshot'],
                action_url='/dashboard/student',
                related_subject=snap.subject,
            ))

        # 4. Badge earned
        from intelligence.models import UserBadge
        recent_badges = UserBadge.objects.filter(
            user=student,
            earned_at__gte=now - timedelta(days=3)
        ).select_related('badge')[:2]

        for ub in recent_badges:
            cards.append(self._build_card(
                audience='student', user=student, institution=institution,
                headline=f"Badge Earned: {ub.badge.name}!",
                body=f"Congratulations! You earned the {ub.badge.name} badge. {ub.badge.description}",
                tone='celebration',
                data_sources=['UserBadge'],
            ))

        self._save_cards(cards)
        return cards

    def generate_for_teacher(self, teacher, institution=None):
        """Generate story cards for a teacher."""
        cards = []
        now = timezone.now()

        # 1. Student improvement
        from analytics.models import SubjectPerformanceSnapshot
        improving_students = SubjectPerformanceSnapshot.objects.filter(
            institution=institution, is_at_risk=False
        ).count()

        total_students = SubjectPerformanceSnapshot.objects.filter(
            institution=institution
        ).values('student').distinct().count()

        if total_students > 0 and improving_students > 0:
            pct = (improving_students / max(total_students, 1)) * 100
            cards.append(self._build_card(
                audience='teacher', user=teacher, institution=institution,
                headline=f"{pct:.0f}% of Students On Track",
                body=f"{improving_students} out of {total_students} student performance snapshots "
                     f"show satisfactory readiness levels. Your teaching impact is showing!",
                tone='positive',
                data_sources=['SubjectPerformanceSnapshot'],
            ))

        # 2. Intervention effectiveness
        from intelligence.models import InterventionPack
        effective_packs = InterventionPack.objects.filter(
            created_by=teacher, status='improved'
        ).count()
        total_packs = InterventionPack.objects.filter(created_by=teacher).count()

        if total_packs > 0:
            rate = (effective_packs / total_packs) * 100
            tone = 'positive' if rate >= 60 else 'neutral'
            cards.append(self._build_card(
                audience='teacher', user=teacher, institution=institution,
                headline=f"Intervention Success Rate: {rate:.0f}%",
                body=f"{effective_packs} of {total_packs} intervention packs you created "
                     f"resulted in improved student outcomes.",
                tone=tone,
                data_sources=['InterventionPack.status'],
            ))

        # 3. Unmarked submissions alert
        from assessments.models import Submission
        unmarked = Submission.objects.filter(
            assessment__created_by=teacher, status='submitted', total_score__isnull=True
        ).count()

        if unmarked > 0:
            cards.append(self._build_card(
                audience='teacher', user=teacher, institution=institution,
                headline=f"{unmarked} Submissions Awaiting Marks",
                body=f"Students are waiting for feedback. Marking submissions promptly "
                     f"helps students learn from their mistakes faster.",
                tone='warning',
                data_sources=['Submission'],
                action_url='/dashboard/teacher',
            ))

        # 4. Teaching wins
        from intelligence.models import TeacherPassport
        passport = TeacherPassport.objects.filter(teacher=teacher).first()
        if passport and passport.total_students_impacted > 0:
            cards.append(self._build_card(
                audience='teacher', user=teacher, institution=institution,
                headline=f"You've Impacted {passport.total_students_impacted} Students",
                body=f"With {passport.total_lessons_delivered} lessons delivered and "
                     f"{passport.total_resources_created} resources created, "
                     f"your reach continues to grow.",
                tone='positive',
                data_sources=['TeacherPassport'],
            ))

        self._save_cards(cards)
        return cards

    def generate_for_parent(self, parent, institution=None):
        """Generate story cards for a parent."""
        cards = []
        from parent_portal.models import ParentStudentLink

        children = ParentStudentLink.objects.filter(
            parent=parent, status='active'
        ).select_related('student')

        for link in children:
            child = link.student

            # 1. Positive attendance
            from attendance.models import DailyRegister
            since = timezone.now().date() - timedelta(days=7)
            total = DailyRegister.objects.filter(student=child, date__gte=since).count()
            present = DailyRegister.objects.filter(student=child, date__gte=since, status='present').count()

            if total > 0:
                rate = (present / total) * 100
                if rate >= 90:
                    cards.append(self._build_card(
                        audience='parent', user=parent, institution=institution,
                        headline=f"{child.full_name} Has Great Attendance!",
                        body=f"Your child attended {present} out of {total} days this week ({rate:.0f}%). Keep it up!",
                        tone='celebration',
                        data_sources=['DailyRegister'],
                    ))
                elif rate < 70:
                    cards.append(self._build_card(
                        audience='parent', user=parent, institution=institution,
                        headline=f"{child.full_name}'s Attendance Needs Attention",
                        body=f"Your child attended only {present} out of {total} days this week ({rate:.0f}%). "
                             f"Regular attendance is key to academic success.",
                        tone='warning',
                        data_sources=['DailyRegister'],
                    ))

            # 2. Subject performance
            from analytics.models import SubjectPerformanceSnapshot
            strong = SubjectPerformanceSnapshot.objects.filter(
                student=child, is_at_risk=False
            ).select_related('subject').first()

            if strong:
                cards.append(self._build_card(
                    audience='parent', user=parent, institution=institution,
                    headline=f"{child.full_name} is Doing Well in {strong.subject.name}",
                    body=f"Readiness score: {strong.exam_readiness_score:.0f}%. "
                         f"Your child is on track in this subject.",
                    tone='positive',
                    data_sources=['SubjectPerformanceSnapshot'],
                    related_subject=strong.subject,
                ))

        self._save_cards(cards)
        return cards

    def generate_for_institution_admin(self, admin, institution):
        """Generate story cards for an institution admin."""
        cards = []

        # 1. Health score summary
        from intelligence.models import InstitutionHealthSnapshot
        latest = InstitutionHealthSnapshot.objects.filter(
            institution=institution
        ).first()

        if latest:
            tone = 'positive' if latest.overall_score >= 70 else 'warning' if latest.overall_score >= 50 else 'warning'
            cards.append(self._build_card(
                audience='institution_admin', user=admin, institution=institution,
                headline=f"School Health Score: {latest.overall_score:.0f}/100",
                body=self._health_summary(latest),
                tone=tone,
                data_sources=['InstitutionHealthSnapshot'],
                action_url='/dashboard/admin',
            ))

        # 2. National exam comparison
        from intelligence.models import NationalExamResult
        results = NationalExamResult.objects.filter(
            institution=institution
        ).order_by('-year')[:2]

        if results.count() >= 2:
            current, previous = results[0], results[1]
            d1_change = current.division_1 - previous.division_1
            direction = 'up' if d1_change > 0 else 'down' if d1_change < 0 else 'stable'
            cards.append(self._build_card(
                audience='institution_admin', user=admin, institution=institution,
                headline=f"National Exam Results: Division 1 {'↑' if direction == 'up' else '↓' if direction == 'down' else '→'}",
                body=f"{current.year}: {current.division_1} Division 1 students "
                     f"(vs {previous.division_1} in {previous.year}). "
                     f"{'Improvement!' if direction == 'up' else 'Needs attention.' if direction == 'down' else 'Holding steady.'}",
                tone='positive' if direction == 'up' else 'warning',
                data_sources=['NationalExamResult'],
            ))

        # 3. Platform adoption
        from analytics.models import AnalyticsEvent
        week_ago = timezone.now() - timedelta(days=7)
        active_users = AnalyticsEvent.objects.filter(
            institution=institution,
            created_at__gte=week_ago
        ).values('user').distinct().count()

        from accounts.models import CustomUser
        total_users = CustomUser.objects.filter(
            Q(student_profile__institution=institution) |
            Q(teacher_profile__institution=institution)
        ).distinct().count()

        if total_users > 0:
            adoption = (active_users / total_users) * 100
            cards.append(self._build_card(
                audience='institution_admin', user=admin, institution=institution,
                headline=f"Platform Adoption: {adoption:.0f}%",
                body=f"{active_users} of {total_users} users were active this week. "
                     f"{'Great adoption!' if adoption >= 70 else 'There is room to grow.'}",
                tone='positive' if adoption >= 70 else 'neutral',
                data_sources=['AnalyticsEvent', 'CustomUser'],
            ))

        self._save_cards(cards)
        return cards

    def _health_summary(self, snapshot):
        """Build a human-readable summary of the health snapshot."""
        parts = []
        components = [
            ('Teacher Activity', snapshot.teacher_activity_score),
            ('Student Attendance', snapshot.student_attendance_score),
            ('Assignment Completion', snapshot.assignment_completion_score),
            ('Resource Engagement', snapshot.resource_engagement_score),
        ]
        strong = [n for n, s in components if s >= 70]
        weak = [n for n, s in components if s < 50]

        if strong:
            parts.append(f"Strong areas: {', '.join(strong)}.")
        if weak:
            parts.append(f"Needs improvement: {', '.join(weak)}.")
        if snapshot.score_change:
            direction = 'up' if snapshot.score_change > 0 else 'down'
            parts.append(f"Score is {direction} {abs(snapshot.score_change):.1f} points from last snapshot.")

        return ' '.join(parts) or "No change from last snapshot."

    def _build_card(self, audience, user=None, institution=None, **kwargs):
        """Build a StoryCard instance (not yet saved)."""
        return StoryCard(
            audience=audience,
            user=user,
            institution=institution,
            **kwargs,
        )

    def _save_cards(self, cards):
        """Bulk create story cards, clear old unread ones first."""
        if cards:
            StoryCard.objects.bulk_create(cards, ignore_conflicts=True)
