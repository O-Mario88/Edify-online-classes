import { CurriculumConfig, SubjectGroup } from './types';

// Rwanda Lower Secondary (O-Level)
const oLevelCore: SubjectGroup = {
  id: "rw-ol-core",
  name: "Core Subjects",
  isRequired: true,
  subjects: [
    { id: "rw-ol-eng", name: "English", category: "compulsory", subjectType: "languages", isCore: true },
    { id: "rw-ol-kinya", name: "Kinyarwanda", category: "compulsory", subjectType: "languages", isCore: true },
    { id: "rw-ol-math", name: "Mathematics", category: "compulsory", subjectType: "sciences", isCore: true },
    { id: "rw-ol-phy", name: "Physics", category: "compulsory", subjectType: "sciences", isCore: true },
    { id: "rw-ol-chem", name: "Chemistry", category: "compulsory", subjectType: "sciences", isCore: true },
    { id: "rw-ol-bio", name: "Biology", category: "compulsory", subjectType: "sciences", isCore: true },
    { id: "rw-ol-geo", name: "Geography and Environment", category: "compulsory", subjectType: "humanities", isCore: true },
    { id: "rw-ol-hist", name: "History and Citizenship", category: "compulsory", subjectType: "humanities", isCore: true },
    { id: "rw-ol-ent", name: "Entrepreneurship", category: "compulsory", subjectType: "vocational", isCore: true },
    { id: "rw-ol-ict", name: "ICT", category: "compulsory", subjectType: "technical", isCore: true }
  ]
};

const oLevelElectives: SubjectGroup = {
  id: "rw-ol-elec",
  name: "Languages & Co-curricular",
  isRequired: false,
  subjects: [
    { id: "rw-ol-fre", name: "French", category: "elective", subjectType: "languages" },
    { id: "rw-ol-swa", name: "Kiswahili", category: "elective", subjectType: "languages" },
    { id: "rw-ol-pe", name: "Physical Education", category: "elective", subjectType: "arts" },
    { id: "rw-ol-re", name: "Religious Education", category: "elective", subjectType: "humanities" }
  ]
};

// Rwanda Upper Secondary (A-Level Pathways)
const aLevelPathways: SubjectGroup = {
  id: "rw-al-pathways",
  name: "Pathway Combinations",
  isRequired: true,
  minimumRequired: 3,
  subjects: [
    { id: "rw-al-pcm", name: "Physics-Chemistry-Mathematics (PCM)", category: "principal", subjectType: "sciences" },
    { id: "rw-al-pcb", name: "Physics-Chemistry-Biology (PCB)", category: "principal", subjectType: "sciences" },
    { id: "rw-al-mcb", name: "Mathematics-Chemistry-Biology (MCB)", category: "principal", subjectType: "sciences" },
    { id: "rw-al-heg", name: "History-Economics-Geography (HEG)", category: "principal", subjectType: "humanities" },
    { id: "rw-al-meg", name: "Mathematics-Economics-Geography (MEG)", category: "principal", subjectType: "humanities" }
  ]
};

const aLevelSubsidiaries: SubjectGroup = {
  id: "rw-al-sub",
  name: "Subsidiary Subjects",
  isRequired: true,
  subjects: [
    { id: "rw-al-gp", name: "General Paper", category: "subsidiary", subjectType: "humanities", isCore: true },
    { id: "rw-al-ent-sub", name: "Entrepreneurship", category: "subsidiary", subjectType: "vocational", isCore: true }
  ]
};

export const rwandaConfig: CurriculumConfig = {
  countryCode: "rwanda",
  countryName: "Rwanda",
  examBody: "REB / NESA",
  educationLevels: [
    {
      id: "rw-olevel",
      name: "Lower Secondary (O-Level)",
      description: "Senior 1 to Senior 3 Competency-Based Curriculum",
      schoolLevel: "secondary",
      isLegacy: false,
      durationYears: 3,
      grades: [
        { id: "rw-s1", name: "Senior 1", description: "First year of O-Level", isExamYear: false, canonicalGrade: 7, subjectGroups: [oLevelCore, oLevelElectives] },
        { id: "rw-s2", name: "Senior 2", description: "Second year of O-Level", isExamYear: false, canonicalGrade: 8, subjectGroups: [oLevelCore, oLevelElectives] },
        { id: "rw-s3", name: "Senior 3", description: "National Examination Year", isExamYear: true, examType: "O-Level National Exams", canonicalGrade: 9, subjectGroups: [oLevelCore, oLevelElectives] }
      ]
    },
    {
      id: "rw-alevel",
      name: "Upper Secondary (A-Level)",
      description: "Senior 4 to Senior 6 specialized combinations",
      schoolLevel: "secondary",
      isLegacy: false,
      durationYears: 3,
      grades: [
        { id: "rw-s4", name: "Senior 4", description: "First year of A-Level", isExamYear: false, canonicalGrade: 10, subjectGroups: [aLevelPathways, aLevelSubsidiaries] },
        { id: "rw-s5", name: "Senior 5", description: "Second year of A-Level", isExamYear: false, canonicalGrade: 11, subjectGroups: [aLevelPathways, aLevelSubsidiaries] },
        { id: "rw-s6", name: "Senior 6", description: "Advanced National Examination Year", isExamYear: true, examType: "A-Level National Exams", canonicalGrade: 12, subjectGroups: [aLevelPathways, aLevelSubsidiaries] }
      ]
    }
  ]
};
