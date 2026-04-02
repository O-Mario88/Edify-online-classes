def calculate_ncdc_score(formative_score, summative_score):
    """
    Combines Formative (out of 20) and Summative (out of 80) scores into
    the official NCDC Lower Secondary total and calculates Grade/Descriptors.
    """
    total = float(formative_score) + float(summative_score)
    total = round(total, 1)
    
    if total >= 90:
        return {'total': total, 'grade': 'A*', 'descriptor': 'Outstanding'}
    elif total >= 80:
        return {'total': total, 'grade': 'A', 'descriptor': 'Excellent'}
    elif total >= 70:
        return {'total': total, 'grade': 'B', 'descriptor': 'Very Good'}
    elif total >= 60:
        return {'total': total, 'grade': 'C', 'descriptor': 'Good'}
    elif total >= 50:
        return {'total': total, 'grade': 'D', 'descriptor': 'Moderate'}
    elif total >= 40:
        return {'total': total, 'grade': 'E', 'descriptor': 'Basic'}
    elif total >= 30:
        return {'total': total, 'grade': 'F', 'descriptor': 'Below Average'}
    else:
        return {'total': total, 'grade': 'G', 'descriptor': 'Ungraded'}

def process_student_subject(student, assigned_class, term):
    """
    Helper function to aggregate all platform and manual assessments 
    for a given term, split them by formative/summative rules if applicable, 
    and calculate the final SubjectGrade.
    """
    from grading.models import SubjectGrade
    from assessments.models import Assessment
    
    # In a full implementation, you would query all assessments tied to this class/term 
    # where Submission.student = student and compute the 20/80 scaling.
    # For now, we simulate the structure.
    
    # Example logic:
    # formative_raw = Assessment.objects.filter(type__in=['quiz', 'assignment'], ...)
    # summative_raw = Assessment.objects.filter(type='exam', ...)
    
    return True
