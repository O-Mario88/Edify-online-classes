import datetime
from django.utils import timezone
from institutions.models import Institution, InstitutionImplementationScorecard, InstitutionMembership

class ChurnSignalAnalyzer:
    """Calculates engagement and adoption metrics to determine the Churn Risk classification for an institution."""

    @staticmethod
    def calculate_institution_risk(institution: Institution) -> dict:
        """
        Produce a risk scorecard dictionary for an institution.
        Return payload includes:
        - risk_score: 0-100 (where 100 is critical danger of churn)
        - classification: 'Healthy', 'Warning', or 'Critical'
        - flags: A list of specific failure reasons triggering the score
        """
        risk_score = 0
        flags = []

        # 1. Syllabus Coverage Delay
        try:
            scorecard = institution.compliance_scorecard
            coverage = scorecard.syllabus_coverage_pct
            # Heuristic: If we are midway through term but coverage is below 15%, that's a red flag.
            if coverage < 15.0:
                risk_score += 40
                flags.append("Syllabus coverage critically lagging (<15%)")
            elif coverage < 35.0:
                risk_score += 15
                flags.append("Syllabus coverage slow (<35%)")
        except InstitutionImplementationScorecard.DoesNotExist:
            risk_score += 20
            flags.append("No active compliance tracking")

        # 2. Teacher Recency Decay (Teachers not logging in)
        teacher_memberships = InstitutionMembership.objects.filter(
            institution=institution, 
            role__in=['class_teacher', 'subject_teacher'],
            status='active'
        ).select_related('user')

        total_teachers = teacher_memberships.count()
        if total_teachers > 0:
            seven_days_ago = timezone.now() - datetime.timedelta(days=7)
            active_recent_teachers = sum(
                1 for m in teacher_memberships 
                if m.user.last_login and m.user.last_login >= seven_days_ago
            )
            adoption_ratio = active_recent_teachers / total_teachers
            
            if adoption_ratio < 0.2:
                risk_score += 50
                flags.append("Severe drop in teacher platform usage (<20% active past week)")
            elif adoption_ratio < 0.5:
                risk_score += 25
                flags.append("Moderate drop in teacher platform usage (<50% active past week)")
        else:
            risk_score += 30
            flags.append("Zero onboarded teachers detected")

        # 3. Overall Risk Calculation
        risk_score = min(score_limit := 100, risk_score)

        if risk_score >= 70:
            classification = "Critical"
        elif risk_score >= 40:
            classification = "Warning"
        else:
            classification = "Healthy"

        # 4. Supplemental UI Data
        total_students = InstitutionMembership.objects.filter(
            institution=institution, role='student', status='active'
        ).count()

        return {
            "institution_id": institution.id,
            "institution_name": institution.name,
            "risk_score": risk_score,
            "classification": classification,
            "flags": flags,
            "active_teachers": total_teachers,
            "students": total_students,
            "timestamp": timezone.now().isoformat()
        }

    @staticmethod
    def analyze_all_institutions() -> list:
        reports = []
        institutions = Institution.objects.filter(status='active' if hasattr(Institution, 'status') else 'is_active') # fallback if status field isn't string
        if hasattr(Institution, 'is_active'):
             institutions = Institution.objects.filter(is_active=True)

        for inst in institutions:
            reports.append(ChurnSignalAnalyzer.calculate_institution_risk(inst))
        
        # Sort by most at risk first
        reports.sort(key=lambda x: x['risk_score'], reverse=True)
        return reports
