import { CurriculumConfig, CountryCode } from './types';
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
 *
 * @param countryCode - The country code ('uganda' | 'kenya' | 'rwanda')
 * @returns CurriculumConfig
 */
export const getCurriculumConfig = (countryCode?: string): CurriculumConfig => {
  if (!countryCode) return ugandaConfig;
  
  const normalizedCode = countryCode.toLowerCase() as CountryCode;
  
  return curriculumRegistry[normalizedCode] || ugandaConfig;
};
