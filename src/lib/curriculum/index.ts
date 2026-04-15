import { CurriculumConfig, CountryCode, SchoolLevel, EducationLevel, Grade } from './types';
import { ugandaConfig } from './uganda';
import { kenyaConfig } from './kenya';
import { rwandaConfig } from './rwanda';

export * from './types';
export * from './uganda';
export * from './kenya';
export * from './rwanda';

// Typed dictionary for curriculum configurations
export const curriculumRegistry: Record<CountryCode, CurriculumConfig> = {
  uganda: ugandaConfig,
  kenya: kenyaConfig,
  rwanda: rwandaConfig
};

/**
 * Retrieves the curriculum configuration for a given country code.
 * Defaults to Uganda if no matching country is found or provided.
 */
export const getCurriculumConfig = (countryCode?: string): CurriculumConfig => {
  if (!countryCode) return ugandaConfig;
  const normalizedCode = countryCode.toLowerCase() as CountryCode;
  return curriculumRegistry[normalizedCode] || ugandaConfig;
};

/**
 * Filters curriculum config to only include education levels matching the specified school level.
 * This is the core school-level scoping function.
 */
export const getCurriculumForSchoolLevel = (
  countryCode: string | undefined,
  schoolLevel: SchoolLevel
): CurriculumConfig => {
  const config = getCurriculumConfig(countryCode);
  return {
    ...config,
    educationLevels: config.educationLevels.filter(
      (level) => level.schoolLevel === schoolLevel
    ),
  };
};

/**
 * Get all grades (classes) available for a school level in a country.
 */
export const getGradesForSchoolLevel = (
  countryCode: string | undefined,
  schoolLevel: SchoolLevel
): Grade[] => {
  const config = getCurriculumForSchoolLevel(countryCode, schoolLevel);
  return config.educationLevels.flatMap((level) => level.grades);
};

/**
 * Get all education levels for a specific school level.
 */
export const getEducationLevelsForSchoolLevel = (
  countryCode: string | undefined,
  schoolLevel: SchoolLevel
): EducationLevel[] => {
  const config = getCurriculumConfig(countryCode);
  return config.educationLevels.filter(
    (level) => level.schoolLevel === schoolLevel
  );
};

/**
 * Check if a grade ID belongs to primary or secondary level.
 */
export const getSchoolLevelForGrade = (
  countryCode: string | undefined,
  gradeId: string
): SchoolLevel | undefined => {
  const config = getCurriculumConfig(countryCode);
  for (const level of config.educationLevels) {
    if (level.grades.some((g) => g.id === gradeId)) {
      return level.schoolLevel;
    }
  }
  return undefined;
};

/**
 * Get primary subjects for a country.
 */
export const getPrimarySubjects = (countryCode?: string) => {
  const config = getCurriculumForSchoolLevel(countryCode, 'primary');
  const subjects = new Map<string, { id: string; name: string }>();
  for (const level of config.educationLevels) {
    for (const grade of level.grades) {
      for (const group of grade.subjectGroups) {
        for (const subject of group.subjects) {
          subjects.set(subject.id, { id: subject.id, name: subject.name });
        }
      }
    }
  }
  return Array.from(subjects.values());
};
