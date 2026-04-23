"""
Role-Based Access Control (RBAC) Matrix

Defines precise capabilities for both platform-wide and institution-level roles.
"""

# Platform Permissions
PERM_MANAGE_PLATFORM_SETTINGS = "MANAGE_PLATFORM_SETTINGS"
PERM_MANAGE_ALL_USERS = "MANAGE_ALL_USERS"
PERM_MANAGE_INSTITUTIONS = "MANAGE_INSTITUTIONS"
PERM_VIEW_GLOBAL_ANALYTICS = "VIEW_GLOBAL_ANALYTICS"

# Institution Permissions
PERM_VIEW_INSTITUTION_DASHBOARD = "VIEW_INSTITUTION_DASHBOARD"
PERM_MANAGE_INSTITUTION_PROFILE = "MANAGE_INSTITUTION_PROFILE"
PERM_MANAGE_TEACHERS = "MANAGE_TEACHERS"
PERM_MANAGE_STUDENTS = "MANAGE_STUDENTS"
PERM_MANAGE_CLASSES = "MANAGE_CLASSES"
PERM_MANAGE_ACADEMIC_TERMS = "MANAGE_ACADEMIC_TERMS"

# Course & Curriculum Permissions
PERM_CREATE_COURSE = "CREATE_COURSE"
PERM_EDIT_OWN_COURSE = "EDIT_OWN_COURSE"
PERM_DELETE_OWN_COURSE = "DELETE_OWN_COURSE"
PERM_VIEW_COURSE_CONTENT = "VIEW_COURSE_CONTENT"

# Academic & Grading
PERM_GRADE_STUDENTS = "GRADE_STUDENTS"
PERM_VIEW_OWN_GRADES = "VIEW_OWN_GRADES"
PERM_VIEW_ALL_GRADES = "VIEW_ALL_GRADES"
PERM_MANAGE_EXAMS = "MANAGE_EXAMS"

# Billing & invoicing permissions removed along with the institution
# finance module. Restore them here if the finance ERP is ever scoped
# back in.

# PLATFORM ROLE MATRIX
PLATFORM_ROLE_MATRIX = {
    "admin": [
        PERM_MANAGE_PLATFORM_SETTINGS,
        PERM_MANAGE_ALL_USERS,
        PERM_MANAGE_INSTITUTIONS,
        PERM_VIEW_GLOBAL_ANALYTICS,
        PERM_VIEW_COURSE_CONTENT,
    ],
    "institution": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
        PERM_MANAGE_INSTITUTION_PROFILE,
        PERM_MANAGE_TEACHERS,
        PERM_MANAGE_STUDENTS,
        PERM_MANAGE_CLASSES,
        PERM_MANAGE_ACADEMIC_TERMS,
        PERM_VIEW_ALL_GRADES,
    ],
    "teacher": [
        PERM_CREATE_COURSE,
        PERM_EDIT_OWN_COURSE,
        PERM_DELETE_OWN_COURSE,
        PERM_VIEW_COURSE_CONTENT,
        PERM_GRADE_STUDENTS,
    ],
    "student": [
        PERM_VIEW_COURSE_CONTENT,
        PERM_VIEW_OWN_GRADES,
    ]
}

# INSTITUTIONAL ROLE MATRIX (Used within an InstitutionMembership context)
INSTITUTIONAL_ROLE_MATRIX = {
    "headteacher": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
        PERM_MANAGE_INSTITUTION_PROFILE,
        PERM_MANAGE_TEACHERS,
        PERM_MANAGE_STUDENTS,
        PERM_MANAGE_CLASSES,
        PERM_MANAGE_ACADEMIC_TERMS,
        PERM_VIEW_ALL_GRADES,
    ],
    "deputy": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
        PERM_MANAGE_TEACHERS,
        PERM_MANAGE_STUDENTS,
        PERM_MANAGE_CLASSES,
        PERM_MANAGE_ACADEMIC_TERMS,
        PERM_VIEW_ALL_GRADES,
    ],
    "dos": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
        PERM_MANAGE_CLASSES,
        PERM_MANAGE_ACADEMIC_TERMS,
        PERM_VIEW_ALL_GRADES,
        PERM_MANAGE_EXAMS,
    ],
    "exam_officer": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
        PERM_MANAGE_EXAMS,
        PERM_VIEW_ALL_GRADES,
    ],
    "bursar": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
    ],
    "ict_admin": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
        PERM_MANAGE_INSTITUTION_PROFILE,
        PERM_MANAGE_TEACHERS,
        PERM_MANAGE_STUDENTS,
    ],
    "class_teacher": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
        PERM_VIEW_COURSE_CONTENT,
        PERM_GRADE_STUDENTS,
        PERM_VIEW_ALL_GRADES, # Usually localized to their class in views
    ],
    "subject_teacher": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
        PERM_VIEW_COURSE_CONTENT,
        PERM_GRADE_STUDENTS,
    ],
    "librarian": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
    ],
    "counselor": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
        PERM_VIEW_ALL_GRADES,
    ],
    "registrar": [
        PERM_VIEW_INSTITUTION_DASHBOARD,
        PERM_MANAGE_STUDENTS,
    ]
}

def has_platform_permission(user, permission_name):
    """Check if a User model instance has a global platform permission."""
    if not user.is_authenticated:
        return False
    if getattr(user, 'is_superuser', False) or user.role == 'admin':
        return True
    
    user_perms = PLATFORM_ROLE_MATRIX.get(user.role, [])
    return permission_name in user_perms
