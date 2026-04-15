export type CountryCode = 'uganda' | 'kenya' | 'rwanda';
export type SchoolLevel = 'primary' | 'secondary';

export interface CurriculumConfig {
  countryCode: CountryCode;
  countryName: string;
  examBody: string;
  educationLevels: EducationLevel[];
}

export interface EducationLevel {
  id: string; // e.g. "o-level", "a-level", "primary", "jss", "sss"
  name: string; // e.g. "Lower Secondary", "Upper Primary"
  description: string;
  schoolLevel: SchoolLevel; // Whether this is a primary or secondary education level
  isLegacy?: boolean; 
  durationYears: number;
  grades: Grade[]; 
}

export interface Grade {
  id: string; // e.g., "senior-1", "p4", "form-1", "grade-10"
  name: string; // Senior 1, Primary 4, Form 1, Grade 10
  description: string;
  isExamYear: boolean;
  isTransitionYear?: boolean; // For P4 transition year support
  examType?: string; // e.g., "UCE", "PLE", "KCSE", "O-Level Exams"
  canonicalGrade: number; // Standardized grade number (4 for P4, 8 for S1, etc.)
  subjectGroups: SubjectGroup[];
}

export interface SubjectGroup {
  id: string;
  name: string; // "Core", "Electives", "Humanities"
  isRequired: boolean;
  minimumRequired?: number;
  maximumAllowed?: number;
  subjects: CurriculumSubject[];
}

export interface CurriculumSubject {
  id: string;
  name: string;
  category: 'compulsory' | 'elective' | 'principal' | 'subsidiary';
  subjectType: 'sciences' | 'humanities' | 'languages' | 'technical' | 'arts' | 'vocational';
  description?: string;
  isCore?: boolean;
}

export interface ContentSubtopic {
  id: string;
  topicId: string;
  name: string;
  order: number;
}

export interface ContentTopic {
  id: string;
  subjectId: string;
  paperId?: string;
  classLevel: string; // 'S1', 'S5-S6'
  name: string;
  description?: string;
  order: number;
  levelGroup: string; // 'Lower Secondary' or 'Upper Secondary'
  subtopics?: ContentSubtopic[];
}

export interface ContentSubjectPaper {
  id: string;
  subjectId: string;
  name: string; // 'Paper 1: Pure Mathematics'
  description?: string;
  order: number;
  topics?: ContentTopic[];
}

export interface ContentSubject {
  id: string;
  name: string;
  country: string;
  level: string; // 'O-Level', 'A-Level'
  classLevels: string[]; // ['S1', 'S2', 'S3', 'S4']
  category: string;
  papers?: ContentSubjectPaper[];
  topics?: ContentTopic[]; // Direct topics if papers aren't used
  active: boolean;
}
