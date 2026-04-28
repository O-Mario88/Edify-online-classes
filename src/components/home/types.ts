/**
 * Shared types + content for the public Maple Africa homepage.
 *
 * Country-dynamic content lives here so the section components stay
 * thin presentational layers. When the user picks a country, the
 * homepage swaps the syllabus card labels (P1–P7 vs Grade 1–6),
 * the curriculum chips (NCDC vs CBC), and the exam-track names
 * (PLE/UCE/UACE vs KCPE/KCSE).
 */

export type CountryCode = 'UG' | 'KE' | 'OTHER' | null;

export interface SyllabusPathway {
  id: string;
  title: string;
  label: string;
  focus: string[];
  features: string[];
  href: string;
}

export interface ScheduledLesson {
  id: string;
  subject: string;
  subjectIcon: string;
  classLevel: string;
  country: 'Uganda' | 'Kenya';
  curriculum: string;
  lessonType: 'Live Lesson' | 'Revision' | 'Clinic' | 'Mock';
  title: string;
  teacherName: string;
  teacherInitials: string;
  startTime: string;
  seatsLeft?: number;
  ctaLabel: string;
}

// ── Demo lessons ─────────────────────────────────────────────────────
// Used when /api/v1/live-sessions/ isn't reachable (visitor isn't
// logged in, network off, etc.). Reflects the four sample cards in
// the spec — handpicked to show range across UG + KE + primary +
// secondary so the homepage feels populated even on a cold start.

export const DEMO_LESSONS: ScheduledLesson[] = [
  {
    id: 'demo-ug-p6-maths',
    subject: 'Mathematics',
    subjectIcon: '🧮',
    classLevel: 'P6',
    country: 'Uganda',
    curriculum: 'Uganda NCDC',
    lessonType: 'Live Lesson',
    title: 'Fractions and Word Problems',
    teacherName: 'Teacher Okello',
    teacherInitials: 'TO',
    startTime: 'Today · 4:00 PM',
    seatsLeft: 12,
    ctaLabel: 'Reserve seat',
  },
  {
    id: 'demo-ke-g7-eng',
    subject: 'English Composition',
    subjectIcon: '✍️',
    classLevel: 'Grade 7',
    country: 'Kenya',
    curriculum: 'Kenya CBC',
    lessonType: 'Live Lesson',
    title: 'Writing a Strong Paragraph',
    teacherName: 'Ms. Achieng',
    teacherInitials: 'MA',
    startTime: 'Today · 5:30 PM',
    seatsLeft: 18,
    ctaLabel: 'Reserve seat',
  },
  {
    id: 'demo-ug-p7-sci',
    subject: 'Science Revision',
    subjectIcon: '🔬',
    classLevel: 'P7 · PLE',
    country: 'Uganda',
    curriculum: 'PLE Preparation',
    lessonType: 'Revision',
    title: 'Human Body Systems',
    teacherName: 'Teacher Sarah',
    teacherInitials: 'TS',
    startTime: 'Tomorrow · 10:00 AM',
    seatsLeft: 7,
    ctaLabel: 'View lesson',
  },
  {
    id: 'demo-ug-s2-maths',
    subject: 'Mathematics Clinic',
    subjectIcon: '📐',
    classLevel: 'S2',
    country: 'Uganda',
    curriculum: 'Uganda Secondary',
    lessonType: 'Clinic',
    title: 'Algebra Made Simple',
    teacherName: 'Mr. Mwangi',
    teacherInitials: 'MM',
    startTime: 'Saturday · 2:00 PM',
    seatsLeft: 22,
    ctaLabel: 'Join class',
  },
];

// ── Syllabus pathways — country-dynamic ──────────────────────────────

export interface SyllabusBundle {
  primary: SyllabusPathway[];
  secondary: SyllabusPathway[];
  /** Lower-secondary section heading */
  secondaryHeading: string;
  /** Primary section heading */
  primaryHeading: string;
}

const FEATURES_FULL = ['Lessons', 'Practice Labs', 'Projects', 'Assessments', 'Teacher Support', 'Exam Practice'];

export const UG_SYLLABUS: SyllabusBundle = {
  primaryHeading: 'Primary Class Syllabus',
  secondaryHeading: 'Secondary Class Syllabus',
  primary: [
    {
      id: 'ug-pri-lower',
      title: 'Lower Primary',
      label: 'P1–P3 · Early Grades',
      focus: ['Reading', 'Number Sense', 'Oral Language', 'Foundational Skills'],
      features: ['Lessons', 'Practice Labs', 'Teacher Support'],
      href: '/primary/class/p1',
    },
    {
      id: 'ug-pri-middle',
      title: 'Middle Primary',
      label: 'P4–P5 · Core Foundation',
      focus: ['Reading Comprehension', 'Mathematics', 'Science', 'Writing'],
      features: ['Lessons', 'Practice Labs', 'Assessments', 'Teacher Support'],
      href: '/primary/class/p4',
    },
    {
      id: 'ug-pri-upper',
      title: 'Upper Primary',
      label: 'P6 · Subject Mastery',
      focus: ['Subject Mastery', 'Practice Labs', 'Teacher Support'],
      features: ['Lessons', 'Practice Labs', 'Projects', 'Teacher Support'],
      href: '/primary/class/p6',
    },
    {
      id: 'ug-pri-candidate',
      title: 'Candidate Class',
      label: 'P7 · PLE Preparation',
      focus: ['PLE Readiness', 'Mock Practice', 'Mistake Notebook', 'Revision Classes'],
      features: ['Lessons', 'Mock Exams', 'Mistake Notebook', 'Teacher Support'],
      href: '/primary/class/p7',
    },
  ],
  secondary: [
    {
      id: 'ug-sec-s1',
      title: 'S1 · Junior Secondary',
      label: 'Foundation Secondary',
      focus: ['Mathematics', 'English', 'Science', 'Social Studies'],
      features: ['Lessons', 'Practice Labs', 'Assessments', 'Teacher Support'],
      href: '/classes',
    },
    {
      id: 'ug-sec-s2',
      title: 'S2 · Junior Secondary',
      label: 'Build Core Subject Mastery',
      focus: ['Mathematics', 'English', 'Biology', 'Geography'],
      features: ['Lessons', 'Practice Labs', 'Projects', 'Assessments'],
      href: '/classes',
    },
    {
      id: 'ug-sec-s34',
      title: 'S3–S4',
      label: 'Lower Secondary Exam Preparation',
      focus: ['UCE Readiness', 'Projects', 'Practice Labs'],
      features: ['Lessons', 'Practice Labs', 'Mock Exams', 'Teacher Support'],
      href: '/classes',
    },
    {
      id: 'ug-sec-s56',
      title: 'S5–S6 · Senior Secondary',
      label: 'Advanced Subject Pathways',
      focus: ['Sciences', 'Arts', 'Business', 'UACE Readiness'],
      features: ['Lessons', 'Mock Exams', 'Projects', 'Teacher Support'],
      href: '/classes',
    },
  ],
};

export const KE_SYLLABUS: SyllabusBundle = {
  primaryHeading: 'Primary Class Syllabus',
  secondaryHeading: 'Junior & Senior School Syllabus',
  primary: [
    {
      id: 'ke-pri-lower',
      title: 'Lower Primary',
      label: 'Grade 1–3 · Early Grades',
      focus: ['Reading', 'Number Sense', 'Oral Language', 'CBC Foundations'],
      features: ['Lessons', 'Practice Labs', 'Teacher Support'],
      href: '/primary/class/p1',
    },
    {
      id: 'ke-pri-upper',
      title: 'Upper Primary',
      label: 'Grade 4–6 · Core Foundation',
      focus: ['Mathematics', 'English', 'Kiswahili', 'Science'],
      features: ['Lessons', 'Practice Labs', 'Assessments', 'Teacher Support'],
      href: '/primary/class/p4',
    },
    {
      id: 'ke-pri-jss-ready',
      title: 'Junior School Readiness',
      label: 'KCPE-era foundations',
      focus: ['Subject Mastery', 'Practice Labs', 'Teacher Support'],
      features: ['Lessons', 'Practice Labs', 'Projects', 'Teacher Support'],
      href: '/primary/class/p6',
    },
    {
      id: 'ke-pri-grade-mastery',
      title: 'Grade-Level Mastery',
      label: 'CBC Performance Tracks',
      focus: ['Competencies', 'Mock Practice', 'Mistake Notebook', 'Revision'],
      features: ['Lessons', 'Mock Exams', 'Mistake Notebook', 'Teacher Support'],
      href: '/primary/class/p7',
    },
  ],
  secondary: [
    {
      id: 'ke-sec-jss7',
      title: 'Junior School · Grade 7',
      label: 'Junior Secondary Foundation',
      focus: ['Mathematics', 'English', 'Integrated Science', 'Social Studies'],
      features: ['Lessons', 'Practice Labs', 'Assessments', 'Teacher Support'],
      href: '/classes',
    },
    {
      id: 'ke-sec-jss89',
      title: 'Junior School · Grade 8–9',
      label: 'Build Core Subject Mastery',
      focus: ['Mathematics', 'English', 'Biology', 'Geography'],
      features: ['Lessons', 'Practice Labs', 'Projects', 'Assessments'],
      href: '/classes',
    },
    {
      id: 'ke-sec-senior',
      title: 'Senior School',
      label: 'Pathways: STEM · Arts · Social Sciences',
      focus: ['Specialised Subjects', 'Projects', 'Practice Labs'],
      features: ['Lessons', 'Practice Labs', 'Mock Exams', 'Teacher Support'],
      href: '/classes',
    },
    {
      id: 'ke-sec-kcse',
      title: 'KCSE Readiness',
      label: 'Senior Secondary Exam Preparation',
      focus: ['Sciences', 'Languages', 'Humanities', 'KCSE Readiness'],
      features: ['Lessons', 'Mock Exams', 'Projects', 'Teacher Support'],
      href: '/classes',
    },
  ],
};

export const NEUTRAL_SYLLABUS: SyllabusBundle = {
  primaryHeading: 'Primary Pathways',
  secondaryHeading: 'Secondary Pathways',
  primary: [
    {
      id: 'neu-pri-lower',
      title: 'Lower Primary',
      label: 'Early Grades',
      focus: ['Reading', 'Number Sense', 'Oral Language', 'Foundations'],
      features: ['Lessons', 'Practice Labs', 'Teacher Support'],
      href: '/primary',
    },
    {
      id: 'neu-pri-middle',
      title: 'Middle Primary',
      label: 'Core Foundation',
      focus: ['Reading Comprehension', 'Mathematics', 'Science', 'Writing'],
      features: ['Lessons', 'Practice Labs', 'Assessments', 'Teacher Support'],
      href: '/primary',
    },
    {
      id: 'neu-pri-upper',
      title: 'Upper Primary',
      label: 'Subject Mastery',
      focus: ['Subject Mastery', 'Practice Labs', 'Teacher Support'],
      features: ['Lessons', 'Practice Labs', 'Projects', 'Teacher Support'],
      href: '/primary',
    },
    {
      id: 'neu-pri-candidate',
      title: 'Candidate Class',
      label: 'Primary Exam Preparation',
      focus: ['Exam Readiness', 'Mock Practice', 'Mistake Notebook', 'Revision'],
      features: ['Lessons', 'Mock Exams', 'Mistake Notebook', 'Teacher Support'],
      href: '/primary',
    },
  ],
  secondary: [
    {
      id: 'neu-sec-junior',
      title: 'Junior Secondary',
      label: 'Foundation Years',
      focus: ['Mathematics', 'English', 'Science', 'Social Studies'],
      features: ['Lessons', 'Practice Labs', 'Assessments', 'Teacher Support'],
      href: '/classes',
    },
    {
      id: 'neu-sec-mid',
      title: 'Mid Secondary',
      label: 'Build Core Mastery',
      focus: ['Mathematics', 'English', 'Biology', 'Geography'],
      features: ['Lessons', 'Practice Labs', 'Projects', 'Assessments'],
      href: '/classes',
    },
    {
      id: 'neu-sec-prep',
      title: 'Lower Secondary Exam Prep',
      label: 'Bridge year',
      focus: ['Subject Mastery', 'Projects', 'Practice Labs'],
      features: ['Lessons', 'Practice Labs', 'Mock Exams', 'Teacher Support'],
      href: '/classes',
    },
    {
      id: 'neu-sec-senior',
      title: 'Senior Secondary',
      label: 'Advanced Pathways',
      focus: ['Sciences', 'Arts', 'Business', 'Exam Readiness'],
      features: ['Lessons', 'Mock Exams', 'Projects', 'Teacher Support'],
      href: '/classes',
    },
  ],
};

export function syllabusFor(country: CountryCode): SyllabusBundle {
  if (country === 'UG') return UG_SYLLABUS;
  if (country === 'KE') return KE_SYLLABUS;
  return NEUTRAL_SYLLABUS;
}

// ── Country store (localStorage) ────────────────────────────────────

const STORAGE_KEY = 'maple:home-country';

export function loadCountry(): CountryCode {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === 'UG' || v === 'KE' || v === 'OTHER') return v;
    return null;
  } catch {
    return null;
  }
}

export function saveCountry(c: CountryCode): void {
  try {
    if (c === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, c);
  } catch {
    // best-effort
  }
}

// ── Available features list (ungated) ─────────────────────────────────

/** Marketing list — the value props on the "Why Maple works" strip. */
export const WHY_MAPLE = [
  {
    icon: 'CalendarDays' as const,
    title: "Today's Learning Plan",
    body: 'A short stack of tasks generated from your strongest and weakest subjects, refreshed each morning.',
  },
  {
    icon: 'Users' as const,
    title: 'Real Teacher Support',
    body: 'Live classes, standby teachers, and graded assessments — every lesson taught by a real human.',
  },
  {
    icon: 'GraduationCap' as const,
    title: 'Exam Readiness',
    body: 'Mock papers in the real format, mistake notebook, and a readiness band that updates as you practise.',
  },
  {
    icon: 'Award' as const,
    title: 'Learning Passport',
    body: 'A verified record of every badge, certificate, and reviewed project — shareable to schools and bursaries.',
  },
];
