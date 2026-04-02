def detect_academic_risk(student, institution, term):
    """
    Core Academic Risk Engine Algorithm.
    Evaluates a student's recent performance against attendance patterns to generate
    Risk Alerts and Automated Interventions.
    """
    from .models import StudentRiskAlert, InterventionPlan, InterventionAction
    from assessments.models import Submission, Assessment
    from attendance.models import DailyRegister, LessonAttendance
    
    # 1. Gather Context
    # Calculate subject-specific baseline vs general average
    # (As specified by User: Teachers see subject-specific baselines, Parents see general)
    
    failed_assessments_count = 0 # Simulated query
    unauthorized_absences = 0 # Simulated query
    
    # Example Trigger Rule: Missed 3 school days + Failed 2 assessments = Amber Risk
    severity = 'yellow'
    reason = []
    
    if unauthorized_absences >= 3:
        severity = 'amber'
        reason.append(f"Recorded {unauthorized_absences} unauthorized offline absences.")
        
    if failed_assessments_count >= 2:
        severity = 'red' if severity == 'amber' else 'amber'
        reason.append(f"Failed {failed_assessments_count} consecutive offline/online assessments.")
        
    if not reason:
        return False # No risk detected
        
    # 2. Generate Alert Structure
    alert_string = " | ".join(reason)
    alert, created = StudentRiskAlert.objects.get_or_create(
        student=student,
        institution=institution,
        status='active',
        defaults={'severity': severity, 'flagged_reason': alert_string}
    )
    
    # 3. Automated Intervention Pipeline
    # Per User feedback on automation logic ("Yes" to auto-triggers)
    if created:
        plan = InterventionPlan.objects.create(
            alert=alert,
            target_outcome="Immediate stabilization of attendance and subject catch-up."
        )
        
        # We auto-generate the Twilio Draft Action 
        # (It can be wired to fire immediately via celery in a fully live environment)
        action = InterventionAction.objects.create(
            plan=plan,
            action_type='parent_message',
            notes="WARNING: Automated Risk Threshold breached. System drafted SMS alert."
        )
        
        print(f"[Risk Engine] Triggered {severity.upper()} alert for {student.email_address}. Parent SMS queued.")
        return True
        
    return False
