/**
 * Role-Based Access Control (RBAC) Matrix
 * 
 * Defines precise capabilities for both platform-wide and institution-level roles.
 * Must be kept in sync with edify_backend/edify_core/rbac.py
 */

export enum Permission {
  // Platform Permissions
  MANAGE_PLATFORM_SETTINGS = "MANAGE_PLATFORM_SETTINGS",
  MANAGE_ALL_USERS = "MANAGE_ALL_USERS",
  MANAGE_INSTITUTIONS = "MANAGE_INSTITUTIONS",
  VIEW_GLOBAL_ANALYTICS = "VIEW_GLOBAL_ANALYTICS",

  // Institution Permissions
  VIEW_INSTITUTION_DASHBOARD = "VIEW_INSTITUTION_DASHBOARD",
  MANAGE_INSTITUTION_PROFILE = "MANAGE_INSTITUTION_PROFILE",
  MANAGE_TEACHERS = "MANAGE_TEACHERS",
  MANAGE_STUDENTS = "MANAGE_STUDENTS",
  MANAGE_CLASSES = "MANAGE_CLASSES",
  MANAGE_ACADEMIC_TERMS = "MANAGE_ACADEMIC_TERMS",

  // Course & Curriculum Permissions
  CREATE_COURSE = "CREATE_COURSE",
  EDIT_OWN_COURSE = "EDIT_OWN_COURSE",
  DELETE_OWN_COURSE = "DELETE_OWN_COURSE",
  VIEW_COURSE_CONTENT = "VIEW_COURSE_CONTENT",

  // Academic & Grading
  GRADE_STUDENTS = "GRADE_STUDENTS",
  VIEW_OWN_GRADES = "VIEW_OWN_GRADES",
  VIEW_ALL_GRADES = "VIEW_ALL_GRADES",
  MANAGE_EXAMS = "MANAGE_EXAMS",

  // Billing & Subscription
  MANAGE_BILLING = "MANAGE_BILLING",
  VIEW_INVOICES = "VIEW_INVOICES",
}

export type PlatformRole = "platform_admin" | "institution_admin" | "independent_teacher" | "universal_student" | "parent";

export const PLATFORM_ROLE_MATRIX: Record<PlatformRole, Permission[]> = {
  platform_admin: [
    Permission.MANAGE_PLATFORM_SETTINGS,
    Permission.MANAGE_ALL_USERS,
    Permission.MANAGE_INSTITUTIONS,
    Permission.VIEW_GLOBAL_ANALYTICS,
    Permission.VIEW_COURSE_CONTENT,
  ],
  institution_admin: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.MANAGE_INSTITUTION_PROFILE,
    Permission.MANAGE_TEACHERS,
    Permission.MANAGE_STUDENTS,
    Permission.MANAGE_CLASSES,
    Permission.MANAGE_ACADEMIC_TERMS,
    Permission.VIEW_ALL_GRADES,
    Permission.MANAGE_BILLING,
    Permission.VIEW_INVOICES,
  ],
  independent_teacher: [
    Permission.CREATE_COURSE,
    Permission.EDIT_OWN_COURSE,
    Permission.DELETE_OWN_COURSE,
    Permission.VIEW_COURSE_CONTENT,
    Permission.GRADE_STUDENTS,
  ],
  universal_student: [
    Permission.VIEW_COURSE_CONTENT,
    Permission.VIEW_OWN_GRADES,
  ],
  parent: [
    Permission.VIEW_OWN_GRADES,
    Permission.VIEW_INVOICES,
  ],
};

// Institutional contexts
export type InstitutionalRole = 
  | "headteacher" 
  | "deputy" 
  | "dos" 
  | "exam_officer" 
  | "bursar" 
  | "ict_admin" 
  | "class_teacher" 
  | "subject_teacher" 
  | "librarian" 
  | "counselor" 
  | "registrar";

export const INSTITUTIONAL_ROLE_MATRIX: Record<InstitutionalRole, Permission[]> = {
  headteacher: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.MANAGE_INSTITUTION_PROFILE,
    Permission.MANAGE_TEACHERS,
    Permission.MANAGE_STUDENTS,
    Permission.MANAGE_CLASSES,
    Permission.MANAGE_ACADEMIC_TERMS,
    Permission.VIEW_ALL_GRADES,
    Permission.MANAGE_BILLING,
    Permission.VIEW_INVOICES,
  ],
  deputy: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.MANAGE_TEACHERS,
    Permission.MANAGE_STUDENTS,
    Permission.MANAGE_CLASSES,
    Permission.MANAGE_ACADEMIC_TERMS,
    Permission.VIEW_ALL_GRADES,
  ],
  dos: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.MANAGE_CLASSES,
    Permission.MANAGE_ACADEMIC_TERMS,
    Permission.VIEW_ALL_GRADES,
    Permission.MANAGE_EXAMS,
  ],
  exam_officer: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.MANAGE_EXAMS,
    Permission.VIEW_ALL_GRADES,
  ],
  bursar: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.MANAGE_BILLING,
    Permission.VIEW_INVOICES,
  ],
  ict_admin: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.MANAGE_INSTITUTION_PROFILE,
    Permission.MANAGE_TEACHERS,
    Permission.MANAGE_STUDENTS,
  ],
  class_teacher: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.VIEW_COURSE_CONTENT,
    Permission.GRADE_STUDENTS,
    Permission.VIEW_ALL_GRADES,
  ],
  subject_teacher: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.VIEW_COURSE_CONTENT,
    Permission.GRADE_STUDENTS,
  ],
  librarian: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
  ],
  counselor: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.VIEW_ALL_GRADES,
  ],
  registrar: [
    Permission.VIEW_INSTITUTION_DASHBOARD,
    Permission.MANAGE_STUDENTS,
  ]
};
