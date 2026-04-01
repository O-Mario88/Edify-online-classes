import { UgandaSubject, UNEBSubjectCombination } from '../types';

export const UNEB_OLEVEL_CORE: UgandaSubject[] = [
  { id: 'math-o', name: 'Mathematics', code: '456', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Core', isCompulsory: true, unebEligible: true, active: true },
  { id: 'eng-o', name: 'English Language', code: '112', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Core', isCompulsory: true, unebEligible: true, active: true },
  { id: 'hist-o', name: 'History & Political Education', code: '241', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Core', isCompulsory: true, unebEligible: true, active: true },
  { id: 'geog-o', name: 'Geography', code: '273', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Core', isCompulsory: true, unebEligible: true, active: true },
  { id: 'phy-o', name: 'Physics', code: '535', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Core', isCompulsory: true, unebEligible: true, active: true },
  { id: 'che-o', name: 'Chemistry', code: '545', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Core', isCompulsory: true, unebEligible: true, active: true },
  { id: 'bio-o', name: 'Biology', code: '553', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Core', isCompulsory: true, unebEligible: true, active: true }
];

export const UNEB_OLEVEL_LOWER_COMPULSORY: UgandaSubject[] = [
  ...UNEB_OLEVEL_CORE,
  { id: 'pe-o', name: 'Physical Education', code: '601', level: 'O-Level', classRange: ['S1', 'S2'], category: 'Compulsory', isCompulsory: true, unebEligible: false, active: true },
  { id: 'cre-o', name: 'Religious Education (CRE/IRE)', code: '223', level: 'O-Level', classRange: ['S1', 'S2'], category: 'Compulsory', isCompulsory: true, unebEligible: true, active: true },
  { id: 'ent-o', name: 'Entrepreneurship', code: '845', level: 'O-Level', classRange: ['S1', 'S2'], category: 'Compulsory', isCompulsory: true, unebEligible: true, active: true },
  { id: 'kis-o', name: 'Kiswahili', code: '336', level: 'O-Level', classRange: ['S1', 'S2'], category: 'Compulsory', isCompulsory: true, unebEligible: true, active: true },
];

export const UNEB_OLEVEL_ELECTIVES: UgandaSubject[] = [
  { id: 'agric-o', name: 'Agriculture', code: '527', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Elective', isCompulsory: false, unebEligible: true, active: true },
  { id: 'comp-o', name: 'Computer Studies', code: '840', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Elective', isCompulsory: false, unebEligible: true, active: true },
  { id: 'lite-o', name: 'Literature in English', code: '208', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Elective', isCompulsory: false, unebEligible: true, active: true },
  { id: 'art-o', name: 'Art and Design', code: '610', level: 'O-Level', classRange: ['S1', 'S2', 'S3', 'S4'], category: 'Elective', isCompulsory: false, unebEligible: true, active: true }
];

export const UNEB_ALEVEL_COMPULSORY: UgandaSubject[] = [
  { id: 'gp-a', name: 'General Paper', code: 'S101', level: 'A-Level', classRange: ['S5', 'S6'], category: 'General Paper', isCompulsory: true, unebEligible: true, active: true }
];

export const UNEB_ALEVEL_SUBSIDIARY: UgandaSubject[] = [
  { id: 'submath-a', name: 'Subsidiary Mathematics', code: 'S475', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Subsidiary', isCompulsory: false, unebEligible: true, active: true },
  { id: 'subict-a', name: 'Subsidiary ICT', code: 'S850', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Subsidiary', isCompulsory: false, unebEligible: true, active: true }
];

export const UNEB_ALEVEL_PRINCIPAL: UgandaSubject[] = [
  { id: 'phy-a', name: 'Physics', code: 'P510', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Principal', isCompulsory: false, unebEligible: true, active: true },
  { id: 'che-a', name: 'Chemistry', code: 'P525', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Principal', isCompulsory: false, unebEligible: true, active: true },
  { id: 'math-a', name: 'Mathematics', code: 'P425', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Principal', isCompulsory: false, unebEligible: true, active: true },
  { id: 'bio-a', name: 'Biology', code: 'P530', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Principal', isCompulsory: false, unebEligible: true, active: true },
  { id: 'econ-a', name: 'Economics', code: 'P220', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Principal', isCompulsory: false, unebEligible: true, active: true },
  { id: 'geog-a', name: 'Geography', code: 'P250', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Principal', isCompulsory: false, unebEligible: true, active: true },
  { id: 'lit-a', name: 'Literature', code: 'P310', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Principal', isCompulsory: false, unebEligible: true, active: true },
  { id: 'hist-a', name: 'History', code: 'P210', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Principal', isCompulsory: false, unebEligible: true, active: true },
  { id: 'ent-a', name: 'Entrepreneurship', code: 'P320', level: 'A-Level', classRange: ['S5', 'S6'], category: 'Principal', isCompulsory: false, unebEligible: true, active: true }
];

export const COMMON_ALEVEL_COMBINATIONS: UNEBSubjectCombination[] = [
  { id: 'pcm', name: 'PCM (Physics, Chemistry, Math)', level: 'A-Level', principalSubjects: ['phy-a', 'che-a', 'math-a'], subsidiaryOptions: ['subict-a'], compulsorySubjects: ['gp-a'] },
  { id: 'pcb', name: 'PCB (Physics, Chemistry, Biology)', level: 'A-Level', principalSubjects: ['phy-a', 'che-a', 'bio-a'], subsidiaryOptions: ['submath-a', 'subict-a'], compulsorySubjects: ['gp-a'] },
  { id: 'bcm', name: 'BCM (Biology, Chemistry, Math)', level: 'A-Level', principalSubjects: ['bio-a', 'che-a', 'math-a'], subsidiaryOptions: ['subict-a'], compulsorySubjects: ['gp-a'] },
  { id: 'meg', name: 'MEG (Math, Economics, Geography)', level: 'A-Level', principalSubjects: ['math-a', 'econ-a', 'geog-a'], subsidiaryOptions: ['subict-a'], compulsorySubjects: ['gp-a'] },
  { id: 'hel', name: 'HEL (History, Economics, Literature)', level: 'A-Level', principalSubjects: ['hist-a', 'econ-a', 'lit-a'], subsidiaryOptions: ['submath-a', 'subict-a'], compulsorySubjects: ['gp-a'] }
];

export const SubjectValidation = {
  validateOLevelSelection: (selectedSubjectIds: string[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const coreMissing = UNEB_OLEVEL_CORE.filter(core => !selectedSubjectIds.includes(core.id));
    
    if (coreMissing.length > 0) {
      errors.push(`Missing mandatory core subjects: ${coreMissing.map(s => s.name).join(', ')}`);
    }

    if (selectedSubjectIds.length < 8) {
      errors.push('You must select at least 8 subjects total (7 core + 1 elective minimum).');
    }

    if (selectedSubjectIds.length > 9) {
      errors.push('You can select a maximum of 9 subjects.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateALevelSelection: (selectedSubjectIds: string[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const principals = selectedSubjectIds.filter(id => UNEB_ALEVEL_PRINCIPAL.some(s => s.id === id));
    const subsidiaries = selectedSubjectIds.filter(id => UNEB_ALEVEL_SUBSIDIARY.some(s => s.id === id));
    
    if (!selectedSubjectIds.includes('gp-a')) {
      errors.push('General Paper (GP) is mandatory.');
    }

    if (principals.length !== 3) {
      errors.push(`You must select exactly 3 Principal subjects (Currently selected: ${principals.length}).`);
    }

    if (subsidiaries.length !== 1) {
      errors.push(`You must select exactly 1 Subsidiary subject (Currently selected: ${subsidiaries.length}).`);
    }

    if (selectedSubjectIds.length !== 5) {
      errors.push('Total selected subjects must be exactly 5 (GP + 3 Principals + 1 Subsidiary).');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
