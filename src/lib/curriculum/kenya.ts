import { CurriculumConfig, SubjectGroup } from './types';

// Kenya Junior Secondary School (CBC)
const jssSubjects: SubjectGroup[] = [
  {
    id: "jss-core",
    name: "Core Learning Areas",
    isRequired: true,
    subjects: [
      { id: "ke-jss-eng", name: "English", category: "compulsory", subjectType: "languages", isCore: true },
      { id: "ke-jss-swa", name: "Kiswahili / KSL", category: "compulsory", subjectType: "languages", isCore: true },
      { id: "ke-jss-math", name: "Mathematics", category: "compulsory", subjectType: "sciences", isCore: true },
      { id: "ke-jss-intsc", name: "Integrated Science", category: "compulsory", subjectType: "sciences", isCore: true },
      { id: "ke-jss-heal", name: "Health Education", category: "compulsory", subjectType: "sciences", isCore: true },
      { id: "ke-jss-pretech", name: "Pre-Technical Studies", category: "compulsory", subjectType: "technical", isCore: true },
      { id: "ke-jss-soc", name: "Social Studies", category: "compulsory", subjectType: "humanities", isCore: true },
      { id: "ke-jss-re", name: "Religious Education", category: "compulsory", subjectType: "humanities", isCore: true },
      { id: "ke-jss-bus", name: "Business Studies", category: "compulsory", subjectType: "technical", isCore: true }
    ]
  }
];

// KCSE (Legacy 8-4-4) Subjects
const kcseCore: SubjectGroup = {
  id: "kcse-core",
  name: "Core Subjects",
  isRequired: true,
  minimumRequired: 3,
  subjects: [
    { id: "ke-kcse-eng", name: "English", category: "compulsory", subjectType: "languages", isCore: true },
    { id: "ke-kcse-swa", name: "Kiswahili", category: "compulsory", subjectType: "languages", isCore: true },
    { id: "ke-kcse-math", name: "Mathematics", category: "compulsory", subjectType: "sciences", isCore: true }
  ]
};

const kcseSciences: SubjectGroup = {
  id: "kcse-sci",
  name: "Sciences",
  isRequired: true,
  minimumRequired: 2,
  subjects: [
    { id: "ke-kcse-bio", name: "Biology", category: "elective", subjectType: "sciences" },
    { id: "ke-kcse-chem", name: "Chemistry", category: "elective", subjectType: "sciences" },
    { id: "ke-kcse-phy", name: "Physics", category: "elective", subjectType: "sciences" }
  ]
};

const kcseHumanities: SubjectGroup = {
  id: "kcse-hum",
  name: "Humanities",
  isRequired: true,
  minimumRequired: 1,
  subjects: [
    { id: "ke-kcse-hist", name: "History & Gov", category: "elective", subjectType: "humanities" },
    { id: "ke-kcse-geo", name: "Geography", category: "elective", subjectType: "humanities" },
    { id: "ke-kcse-re", name: "Religious Education", category: "elective", subjectType: "humanities" }
  ]
};

const kcseTechnical: SubjectGroup = {
  id: "kcse-tech",
  name: "Technical & Applied",
  isRequired: false,
  subjects: [
    { id: "ke-kcse-agri", name: "Agriculture", category: "elective", subjectType: "technical" },
    { id: "ke-kcse-bus", name: "Business Studies", category: "elective", subjectType: "technical" },
    { id: "ke-kcse-comp", name: "Computer Studies", category: "elective", subjectType: "technical" },
    { id: "ke-kcse-home", name: "Home Science", category: "elective", subjectType: "vocational" }
  ]
};

export const kenyaConfig: CurriculumConfig = {
  countryCode: "kenya",
  countryName: "Kenya",
  examBody: "KNEC",
  educationLevels: [
    {
      id: "ke-cbc-jss",
      name: "Junior Secondary (CBC)",
      description: "Grades 7, 8, and 9 under the new Competency-Based Curriculum",
      schoolLevel: "secondary",
      isLegacy: false,
      durationYears: 3,
      grades: [
        { id: "grade-7", name: "Grade 7", description: "First year of JSS", isExamYear: false, canonicalGrade: 7, subjectGroups: jssSubjects },
        { id: "grade-8", name: "Grade 8", description: "Second year of JSS", isExamYear: false, canonicalGrade: 8, subjectGroups: jssSubjects },
        { id: "grade-9", name: "Grade 9", description: "Final year of JSS with National Assessment", isExamYear: true, examType: "JSS Assessment", canonicalGrade: 9, subjectGroups: jssSubjects }
      ]
    },
    {
      id: "ke-844-secondary",
      name: "KCSE Secondary (8-4-4)",
      description: "Forms 1-4 leading to the Kenya Certificate of Secondary Education",
      schoolLevel: "secondary",
      isLegacy: true,
      durationYears: 4,
      grades: [
        { id: "form-1", name: "Form 1", description: "Broad foundation year", isExamYear: false, canonicalGrade: 9, subjectGroups: [kcseCore, kcseSciences, kcseHumanities, kcseTechnical] },
        { id: "form-2", name: "Form 2", description: "Continued foundation", isExamYear: false, canonicalGrade: 10, subjectGroups: [kcseCore, kcseSciences, kcseHumanities, kcseTechnical] },
        { id: "form-3", name: "Form 3", description: "Subject selection focus", isExamYear: false, canonicalGrade: 11, subjectGroups: [kcseCore, kcseSciences, kcseHumanities, kcseTechnical] },
        { id: "form-4", name: "Form 4", description: "KCSE examination year", isExamYear: true, examType: "KCSE", canonicalGrade: 12, subjectGroups: [kcseCore, kcseSciences, kcseHumanities, kcseTechnical] }
      ]
    }
  ]
};
