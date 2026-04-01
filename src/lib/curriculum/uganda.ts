import { CurriculumConfig, SubjectGroup } from './types';

// Uganda Lower Secondary (O-Level) - UNEB
const oLevelCore: SubjectGroup = {
  id: "ug-ol-core",
  name: "Core Subjects",
  isRequired: true,
  subjects: [
    { id: "ug-ol-eng", name: "English Language", category: "compulsory", subjectType: "languages", isCore: true },
    { id: "ug-ol-math", name: "Mathematics", category: "compulsory", subjectType: "sciences", isCore: true },
    { id: "ug-ol-phy", name: "Physics", category: "compulsory", subjectType: "sciences", isCore: true },
    { id: "ug-ol-chem", name: "Chemistry", category: "compulsory", subjectType: "sciences", isCore: true },
    { id: "ug-ol-bio", name: "Biology", category: "compulsory", subjectType: "sciences", isCore: true },
    { id: "ug-ol-geo", name: "Geography", category: "compulsory", subjectType: "humanities", isCore: true },
    { id: "ug-ol-hist", name: "History", category: "compulsory", subjectType: "humanities", isCore: true }
  ]
};

const oLevelElectives: SubjectGroup = {
  id: "ug-ol-elec",
  name: "Electives",
  isRequired: true,
  minimumRequired: 1, // Minimum 8 subjects total for UNEB UCE
  maximumAllowed: 3,  // Maximum 10 subjects total
  subjects: [
    { id: "ug-ol-lit", name: "Literature in English", category: "elective", subjectType: "languages" },
    { id: "ug-ol-cre", name: "Christian Religious Education", category: "elective", subjectType: "humanities" },
    { id: "ug-ol-ire", name: "Islamic Religious Education", category: "elective", subjectType: "humanities" },
    { id: "ug-ol-agri", name: "Agriculture", category: "elective", subjectType: "technical" },
    { id: "ug-ol-comp", name: "Computer Studies", category: "elective", subjectType: "technical" },
    { id: "ug-ol-com", name: "Commerce", category: "elective", subjectType: "humanities" },
    { id: "ug-ol-fineart", name: "Fine Art", category: "elective", subjectType: "arts" },
    { id: "ug-ol-french", name: "French", category: "elective", subjectType: "languages" },
    { id: "ug-ol-lug", name: "Luganda", category: "elective", subjectType: "languages" }
  ]
};

// Uganda Upper Secondary (A-Level) - UNEB
const aLevelPrincipals: SubjectGroup = {
  id: "ug-al-prin",
  name: "Principal Subjects",
  isRequired: true,
  minimumRequired: 3,
  maximumAllowed: 3, // Valid UACE requires exactly 3 principals
  subjects: [
    { id: "ug-al-math", name: "Mathematics", category: "principal", subjectType: "sciences" },
    { id: "ug-al-phy", name: "Physics", category: "principal", subjectType: "sciences" },
    { id: "ug-al-chem", name: "Chemistry", category: "principal", subjectType: "sciences" },
    { id: "ug-al-bio", name: "Biology", category: "principal", subjectType: "sciences" },
    { id: "ug-al-econ", name: "Economics", category: "principal", subjectType: "humanities" },
    { id: "ug-al-hist", name: "History", category: "principal", subjectType: "humanities" },
    { id: "ug-al-geo", name: "Geography", category: "principal", subjectType: "humanities" },
    { id: "ug-al-lit", name: "Literature in English", category: "principal", subjectType: "languages" },
    { id: "ug-al-cre", name: "Christian Religious Education", category: "principal", subjectType: "humanities" },
    { id: "ug-al-ire", name: "Islamic Religious Education", category: "principal", subjectType: "humanities" },
    { id: "ug-al-fineart", name: "Fine Art", category: "principal", subjectType: "arts" },
    { id: "ug-al-agri", name: "Agriculture", category: "principal", subjectType: "technical" }
  ]
};

const aLevelSubsidiaries: SubjectGroup = {
  id: "ug-al-sub",
  name: "Subsidiary Subjects",
  isRequired: true,
  minimumRequired: 2,
  maximumAllowed: 2, // Must take General Paper + ONE other subsidiary (ICT or Sub Math)
  subjects: [
    { id: "ug-al-gp", name: "General Paper", category: "subsidiary", subjectType: "humanities", isCore: true },
    { id: "ug-al-ict", name: "Subsidiary ICT", category: "subsidiary", subjectType: "technical" },
    { id: "ug-al-submath", name: "Subsidiary Mathematics", category: "subsidiary", subjectType: "sciences" }
  ]
};

export const ugandaConfig: CurriculumConfig = {
  countryCode: "uganda",
  countryName: "Uganda",
  examBody: "UNEB",
  educationLevels: [
    {
      id: "ug-olevel",
      name: "O'level (Ordinary Level)",
      description: "Senior 1-4 standard UNEB curriculum",
      isLegacy: false,
      durationYears: 4,
      grades: [
        { id: "senior-1", name: "Senior 1", description: "First year of O-Level", isExamYear: false, subjectGroups: [oLevelCore, oLevelElectives] },
        { id: "senior-2", name: "Senior 2", description: "Second year of O-Level", isExamYear: false, subjectGroups: [oLevelCore, oLevelElectives] },
        { id: "senior-3", name: "Senior 3", description: "O-Level Subject Selection Focus", isExamYear: false, subjectGroups: [oLevelCore, oLevelElectives] },
        { id: "senior-4", name: "Senior 4", description: "UCE National Examination Year", isExamYear: true, examType: "UCE", subjectGroups: [oLevelCore, oLevelElectives] }
      ]
    },
    {
      id: "ug-alevel",
      name: "A'level (Advanced Level)",
      description: "Senior 5-6 UACE preparation",
      isLegacy: false,
      durationYears: 2,
      grades: [
        { id: "senior-5", name: "Senior 5", description: "First year of A-Level Subject Combinations", isExamYear: false, subjectGroups: [aLevelPrincipals, aLevelSubsidiaries] },
        { id: "senior-6", name: "Senior 6", description: "UACE National Examination Year", isExamYear: true, examType: "UACE", subjectGroups: [aLevelPrincipals, aLevelSubsidiaries] }
      ]
    }
  ]
};
