// Enhanced User Types for Hybrid Business Model
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'platform_admin' | 'institution_admin' | 'independent_teacher' | 'universal_student' | 'parent';
  avatar: string;
  phone?: string;
  location?: string;
  countryCode?: 'uganda' | 'kenya' | 'rwanda';
  verification_status?: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

// Universal Student with Multiple Statuses
export interface UniversalStudent extends User {
  role: 'universal_student';
  student_statuses: {
    independent: IndependentStudentStatus;
    institutional: InstitutionalStudentStatus[];
  };
  preferences: {
    subjects: string[];
    level: 'O-level' | 'A-level';
    learning_style: string;
  };
  payment_methods?: PaymentMethod[];
  uneb_readiness?: {
    overall_score: number; // 0-100
    exam_target: 'UCE' | 'UACE';
    topics_confidence: Array<{ subject: string; confidence: number }>;
    rescue_plan_active?: boolean;
    predicted_division?: number;
  };
}

export interface IndependentStudentStatus {
  active: boolean;
  marketplace_courses: string[]; // Course IDs
  total_spent: number;
  points_earned: number;
  achievements: string[];
}

export interface InstitutionalStudentStatus {
  institution_id: string;
  institution_name: string;
  student_id: string;
  class: string;
  enrollment_date: string;
  status: 'active' | 'suspended' | 'graduated';
  fees_paid: boolean;
  academic_year: string;
}

// Institution (School) Type
export interface Institution {
  id: string;
  name: string;
  admin_id: string;
  countryCode?: 'uganda' | 'kenya' | 'rwanda';
  type: 'primary' | 'secondary' | 'technical' | 'university';
  registration_number: string;
  location: {
    district: string;
    region: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'suspended' | 'trial';
    cost_per_student: number;
    total_students: number;
    billing_cycle: 'monthly' | 'yearly';
    next_payment: string;
  };
  public_profile: {
    visible: boolean;
    description: string;
    logo?: string;
    cover_image?: string;
    enrollment_fee: number;
    application_requirements: string[];
    facilities: string[];
    achievements: string[];
    success_stories: string[];
  };
  exam_center: {
    is_registered: boolean;
    uneb_center_code?: string;
    exam_fee: number;
    capacity: number;
    facilities: string[];
    past_performance: {
      year: string;
      pass_rate: number;
      total_candidates: number;
    }[];
  };
  teachers: string[]; // Teacher IDs
  students: string[]; // Student IDs
  content_library: string[]; // Private content IDs
  analytics: InstitutionAnalytics;
}

// Independent Teacher Type  
export interface IndependentTeacher extends User {
  role: 'independent_teacher';
  professional_info: {
    qualifications: string[];
    specializations: string[];
    teaching_experience: number;
    bio: string;
    linkedin?: string;
  };
  membership: {
    plan: 'basic' | 'premium' | 'pro';
    status: 'active' | 'suspended' | 'pending';
    fee_paid: number;
    expiry_date: string;
  };
  marketplace_profile: {
    rating: number;
    total_reviews: number;
    total_students: number;
    total_courses: number;
    total_earnings: number;
    featured: boolean;
  };
  courses: MarketplaceItem[];
  analytics: TeacherAnalytics;
  bank_details: {
    account_name: string;
    account_number: string;
    bank_name: string;
    mobile_money?: string;
  };
}

// Legacy types for backward compatibility
export interface Student {
  id: string;
  name: string;
  email: string;
  role: 'student';
  avatar: string;
  class: string;
  level: 'O\'level' | 'A\'level';
  school?: string;
  combination?: string;
  parentEmail: string;
  enrolledSubjects: string[];
  completedLessons: string[];
  joinDate: string;
  paymentStatus: 'active' | 'inactive' | 'pending';
  totalPaid: number;
  totalPaidUGX: number;
  forumPosts: number;
  lastLogin: string;
  targetExam: 'UCE' | 'UACE';
  examYear: number;
  preferredLanguage: string;
  location: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  role: 'teacher';
  avatar: string;
  bio: string;
  subjects: string[];
  levels: string[];
  classes: string[];
  qualification: string;
  experience: string;
  rating: number;
  totalStudents: number;
  joinDate: string;
  verified: boolean;
  reputation?: {
    responseRate: number; // percentage
    avgResponseTimeMins: number;
    badges: string[];
    reviewCount: number;
  };
  specializations: string[];
  earnings: {
    totalEarned: number;
    currentMonth: number;
    pendingPayouts: number;
  };
  membershipType: 'basic' | 'premium';
  membershipExpiry: string;
  languagesSpoken: string[];
}

export interface Administrator {
  id: string;
  name: string;
  email: string;
  role: 'administrator';
  avatar: string;
  title: string;
  permissions: string[];
  joinDate: string;
}

// Course Types
export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'exercise' | 'notes';
  duration?: string;
  videoUrl?: string;
  questions?: number;
  completed: boolean;
}

export interface Subtopic {
  id: string;
  name: string;
  lessons: Lesson[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  subtopics: Subtopic[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  category: 'compulsory' | 'principal' | 'subsidiary';
  subject_type: 'sciences' | 'humanities' | 'languages' | 'technical' | 'arts';
  teacherId: string;
  isCore?: boolean;
  combinations?: string[];
  topics: Topic[];
}

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  subjects: Subject[];
}

export interface UgandaClass {
  id: string;
  name: string;
  level: 'O\'level' | 'A\'level';
  description: string;
  price: number;
  priceUGX: number;
  isExamYear?: boolean;
  examType?: 'UCE' | 'UACE';
  subjectCombinations?: string[];
  terms: Term[];
}

export interface UgandaLevel {
  id: string;
  name: string;
  description: string;
  classes: UgandaClass[];
}

export interface SubjectType {
  name: string;
  description: string;
  color: string;
}

export interface SubjectCombination {
  name: string;
  description: string;
  subjects: string[];
}

export interface ExamInfo {
  name: string;
  level: string;
  examPeriod: string;
  registrationDeadline: string;
  subjects?: string[];
}

// Forum Types
export interface ForumReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  likes: number;
  isTeacherApproved?: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  updatedAt: string;
  replies: ForumReply[];
  tags: string[];
  views: number;
  likes: number;
  isPinned: boolean;
  isSolved: boolean;
}

export interface ForumCategory {
  id: string;
  name: string;
  level: 'grade' | 'subject' | 'topic' | 'subtopic';
  subcategories?: ForumCategory[];
  posts?: ForumPost[];
}

// Live Session Types
// WEBINAR LIVE SESSION TYPES
export interface WebinarSession {
  id: string;
  courseId?: string;
  institutionId?: string;
  hostId: string;
  hostName: string;
  title: string;
  description: string;
  subject: string;
  type?: string;
  scheduledStart: string; // ISO String
  scheduledEnd: string; // ISO String
  timezone: string;
  durationMinutes: number;
  meetingProvider: 'google_meet' | 'custom';
  meetingUrl?: string; // Auto-generated
  calendarProvider: 'google_calendar';
  calendarEventId?: string; // Auto-generated
  attendanceMode: 'strict' | 'open';
  capacity: number;
  enrolledCount: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  recordingUrl?: string;
  resources?: Array<{ title: string; url: string }>;
  notes?: string;
  reminderSettings: {
    send24h: boolean;
    send1h: boolean;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// UNEB SUBJECT CATALOGUE TYPES
export interface UgandaSubject {
  id: string;
  name: string;
  code: string;
  level: 'O-Level' | 'A-Level';
  classRange: string[]; // e.g. ["S1", "S2", "S3", "S4"]
  category: 'Compulsory' | 'Core' | 'Elective' | 'Principal' | 'Subsidiary' | 'General Paper';
  isCompulsory: boolean;
  unebEligible: boolean;
  active: boolean;
}

export interface UNEBSubjectCombination {
  id: string;
  name: string;      // e.g. "PCM"
  level: 'A-Level';
  principalSubjects: string[]; // array of subject codes/ids
  subsidiaryOptions: string[]; // e.g. Math or ICT
  compulsorySubjects: string[]; // GP
}

export interface UNEBRegistration {
  id: string;
  studentId: string;
  level: 'O-Level' | 'A-Level';
  classLevel: string;
  selectedSubjects: string[]; // Subject IDs
  combination?: string; // Only for A-Level
  registrationStatus: 'pending' | 'validated' | 'submitted';
  paymentStatus: 'unpaid' | 'paid';
  centerId?: string;
  validationErrors?: string[];
}

// Legacy Payment Types (for backward compatibility)
export interface LegacyTransaction {
  id: string;
  studentId?: string;
  studentName?: string;
  teacherId?: string;
  teacherName?: string;
  type: 'subscription' | 'teacher_membership';
  grade?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

export interface PayoutRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  amount: number;
  currency: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  earnings: {
    totalEarned: number;
    platformFee: number;
    netEarnings: number;
  };
}

// Pricing Types
export interface PricingTier {
  name: string;
  grades: string[];
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  features: string[];
}

export interface TeacherMembership {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  features: string[];
  limits: {
    maxCourses: string | number;
    maxStudentsPerCourse: string | number;
    videoUploadLimit: string;
  };
}

// AI Learning Path Types
export interface SkillNode {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  status: 'mastered' | 'current' | 'recommended' | 'locked';
  position: { x: number; y: number };
  estimatedHours: number;
  topics: string[];
  mastery: number;
}

export interface SkillTree {
  id: string;
  name: string;
  level: string;
  class: string;
  subject: string;
  totalNodes: number;
  estimatedHours: number;
  nodes: SkillNode[];
  connections: Array<{ from: string; to: string }>;
}

export interface LearningPath {
  studentId: string;
  currentPath: string;
  recommendations: {
    nextTopic: string;
    reviewTopics: string[];
    strengthAreas: string[];
    improvementAreas: string[];
    studyTime: {
      recommended: number;
      current: number;
    };
    learningStyle: string;
    preferredSchedule: string;
  };
  weeklyPlan: Array<{
    day: string;
    topic: string;
    activity: string;
    duration: number;
    type: 'review' | 'practice' | 'new' | 'application';
  }>;
}

export interface DiagnosticQuiz {
  id: string;
  title: string;
  subject: string;
  class: string;
  estimatedMinutes: number;
  questions: Array<{
    id: string;
    type: 'multiple-choice' | 'short-answer';
    question: string;
    options?: string[];
    correctAnswer: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}

// Project-Based Learning Types
export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  classes: string[];
  duration: string;
  groupSize: { min: number; max: number };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  ugandaRelevance: 'low' | 'medium' | 'high';
  objectives: string[];
  deliverables: string[];
  resources: string[];
  assessment: Record<string, number>;
  tags: string[];
}

export interface ActiveProject {
  id: string;
  templateId: string;
  title: string;
  groupMembers: Array<{
    studentId: string;
    name: string;
    role: string;
    contributions: string[];
  }>;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  progress: number;
  startDate: string;
  dueDate: string;
  currentPhase: string;
  milestones: Array<{
    name: string;
    completed: boolean;
    completedDate?: string;
    dueDate?: string;
  }>;
  documents: Array<{
    name: string;
    type: 'document' | 'whiteboard' | 'presentation';
    lastModified: string;
    author: string;
  }>;
  chatHistory: Array<{
    author: string;
    message: string;
    timestamp: string;
  }>;
}

// AI Teaching Assistant Types
export interface ConfusionReport {
  weekStart: string;
  weekEnd: string;
  subjects: Record<string, {
    topConfusedTopics: Array<{
      topic: string;
      confusionScore: number;
      helpRequests: number;
      commonMistakes: string[];
      recommendedAction: string;
    }>;
    engagementMetrics: {
      averageTimePerLesson: number;
      completionRate: number;
      helpRequestFrequency: number;
    };
  }>;
  overallInsights: string[];
}

export interface SmartReply {
  question: string;
  category: string;
  suggestedReply: string;
  relatedContent: string[];
  frequency: number;
}

export interface AutoGeneratedQuiz {
  id: string;
  subject: string;
  topic: string;
  class: string;
  generatedDate: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  questions: Array<{
    id: string;
    type: 'multiple-choice' | 'short-answer' | 'essay';
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    sourceContent: string;
  }>;
  deploymentStatus: 'draft' | 'ready' | 'deployed';
  targetStudents: string[];
}

// Peer Tutoring Types
export interface PeerTutor {
  id: string;
  studentId: string;
  name: string;
  class: string;
  level: string;
  subjects: string[];
  specializations: string[];
  certification: {
    status: 'pending' | 'verified' | 'rejected';
    verifiedBy?: string;
    verificationDate?: string;
    requirements: {
      averageGrade: string;
      teacherRecommendation: boolean;
      peerFeedback: number;
    };
  };
  stats: {
    totalSessions: number;
    successRate: number;
    rating: number;
    reviews: number;
    pointsEarned: number;
    hoursContributed: number;
  };
  availability: {
    timezone: string;
    weekdays: string[];
    times: string[];
    weekends: string[];
    weekendTimes: string[];
  };
  bio: string;
  achievements: string[];
  languages: string[];
  reviews: Array<{
    studentId: string;
    rating: number;
    comment: string;
    date: string;
    subject: string;
  }>;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  level: string;
  targetExam: string;
  examDate: string;
  creator: string;
  members: Array<{
    studentId: string;
    name: string;
    role: 'leader' | 'co-leader' | 'member';
    joinDate: string;
  }>;
  maxMembers: number;
  isPublic: boolean;
  status: 'active' | 'inactive' | 'completed';
  schedule: {
    recurring: boolean;
    pattern: 'weekly' | 'bi-weekly' | 'monthly';
    day: string;
    time: string;
    duration: number;
    timezone: string;
  };
  nextSession: string;
  topics: string[];
  resources: string[];
  stats: {
    sessionsCompleted: number;
    averageAttendance: number;
    memberSatisfaction: number;
  };
  recentActivity?: Array<{
    type: string;
    description: string;
    date: string;
    participants?: number;
    addedBy?: string;
  }>;
}

export interface TutoringBooking {
  id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  sessionType: '1-on-1' | 'group';
  pointsCost: number;
  notes: string;
  zoomLink?: string;
}

// Marketplace Item System (Subject -> Class -> Topic)
export interface MarketplaceItem {
  id: string;
  teacher_id: string;
  teacher_name: string;
  title: string;
  description: string;
  country: string;
  subjectId: string;
  classLevelId: string;
  topicId: string;
  resourceType: 'video' | 'notes' | 'assessment' | 'bundle';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  currency: 'UGX' | 'KES' | 'RWF';
  duration_hours: number;
  lessons: CourseLesson[];
  prerequisites: string[];
  learning_outcomes: string[];
  preview_video?: string;
  thumbnail: string;
  tags: string[];
  rating: number;
  total_reviews: number;
  total_enrollments: number;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'suspended';
  license_deals: LicenseDeal[];
}

export interface CourseLesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration_minutes: number;
  content_url?: string;
  is_preview: boolean;
  order: number;
}

export interface LicenseDeal {
  institution_id: string;
  institution_name: string;
  license_fee: number;
  students_covered: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired';
}

// Payment System Types
export interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'bank_card' | 'bank_transfer';
  provider: 'MTN' | 'Airtel' | 'Visa' | 'Mastercard' | 'Bank';
  account_number: string;
  is_primary: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'course_purchase' | 'subscription_payment' | 'enrollment_fee' | 'exam_fee' | 'teacher_payout';
  amount: number;
  currency: 'UGX';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: PaymentMethod;
  reference_id: string;
  description: string;
  created_at: string;
  completed_at?: string;
  metadata: {
    course_id?: string;
    institution_id?: string;
    exam_center_id?: string;
    academic_year?: string;
  };
}

// UNEB Exam Center System
export interface ExamCenter {
  id: string;
  institution_id: string;
  uneb_center_code: string;
  name: string;
  location: {
    district: string;
    region: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  contact: {
    phone: string;
    email: string;
  };
  capacity: {
    total_seats: number;
    available_seats: number;
    rooms: ExamRoom[];
  };
  fees: {
    uce: number;
    uace: number;
    registration_fee: number;
  };
  facilities: string[];
  certification: {
    uneb_approved: boolean;
    approval_date: string;
    expiry_date: string;
  };
  performance_history: {
    year: string;
    exam_type: 'UCE' | 'UACE';
    total_candidates: number;
    pass_rate: number;
    distinction_rate: number;
  }[];
  current_registrations: ExamRegistration[];
}

export interface ExamRoom {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  accessibility: boolean;
}

export interface ExamRegistration {
  id: string;
  student_id: string;
  exam_center_id: string;
  exam_type: 'UCE' | 'UACE';
  academic_year: string;
  subjects: string[];
  fee_paid: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  application_date: string;
  approval_date?: string;
  documents: {
    id_copy: string;
    academic_records: string;
    passport_photo: string;
  };
}

// Analytics Types
export interface InstitutionAnalytics {
  financial: {
    monthly_revenue: number;
    subscription_cost: number;
    profit_margin: number;
    student_acquisition_cost: number;
  };
  academic: {
    average_performance: number;
    subject_performance: { [subject: string]: number };
    attendance_rate: number;
    completion_rate: number;
  };
  engagement: {
    active_students: number;
    forum_participation: number;
    live_session_attendance: number;
  };
}

export interface TeacherAnalytics {
  financial: {
    total_earnings: number;
    monthly_earnings: number;
    pending_payouts: number;
    average_course_price: number;
  };
  performance: {
    total_students_taught: number;
    average_rating: number;
    course_completion_rate: number;
    student_satisfaction: number;
  };
  engagement: {
    active_courses: number;
    monthly_enrollments: number;
    forum_responses: number;
    live_sessions_conducted: number;
  };
}

export interface PlatformAnalytics {
  revenue: {
    total_monthly_revenue: number;
    b2b_subscriptions: number;
    marketplace_commissions: number;
    exam_center_fees: number;
  };
  users: {
    total_institutions: number;
    total_independent_teachers: number;
    total_students: number;
    monthly_active_users: number;
  };
  geographic: {
    districts_covered: number;
    top_performing_regions: string[];
    underserved_areas: string[];
  };
  market_intelligence: {
    average_course_price: number;
    popular_subjects: string[];
    growth_trends: { month: string; growth_rate: number }[];
  };
}

// ==== Phase 1: AI Study Copilot ====
export interface AICopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  contextRelated?: {
    courseId?: string;
    lessonId?: string;
    topicId?: string;
  };
}

export interface AIStudyPlan {
  id: string;
  studentId: string;
  createdAt: string;
  milestones: Array<{
    week: number;
    focus: string;
    completed: boolean;
  }>;
  recommendedResources: string[];
}

// ==== Phase 1: Parent Portal ====
export interface ParentUser extends User {
  role: 'parent';
  children: Array<{
    studentId: string;
    relationship: 'mother' | 'father' | 'guardian';
  }>;
  preferences: {
    receiveWeeklySummaries: boolean;
    receiveAlerts: boolean;
    notificationChannels: Array<'email' | 'whatsapp' | 'sms'>;
  };
}

// ==== Phase 8: Resource Engagement Tracking ====
export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'notes' | 'slides' | 'interactive';
  format?: string;
  url?: string;
  content?: string; // For rendered text notes
  subjectId?: string;
  classId?: string;
  topicId?: string;
  lessonId?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  size?: string;
}

export interface ResourceEngagement {
  id: string;
  studentId: string;
  resourceId: string;
  assignedBy: 'teacher' | 'intervention' | 'self' | 'system';
  firstAccessedAt: string;
  lastAccessedAt: string;
  totalActiveTimeMins: number;
  totalSessions: number;
  completionPercentage: number;
  lastPosition: number; // Seconds for video, Page/Scroll percentage for PDF/Text
  isCompleted: boolean;
}

export interface ResourceAnalyticsSummary {
  resourceId: string;
  assignedStudentsCount: number;
  openedByCount: number;
  completedByCount: number;
  averageActiveTimeMins: number;
  averageCompletionPercentage: number;
  topEngagedStudentIds: string[];
  leastEngagedStudentIds: string[];
}
