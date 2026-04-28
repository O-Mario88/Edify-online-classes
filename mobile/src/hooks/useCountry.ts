import { useEffect } from 'react';
import { useCountryStore } from '@/storage/countryStore';
import { COUNTRY_CATALOGUE, type CountryCode, type CountryConfig } from '@/config/countries';

interface UseCountryReturn {
  code: CountryCode;
  config: CountryConfig;
  hydrated: boolean;
  setCode: (code: CountryCode) => Promise<void>;
}

/**
 * React-friendly accessor for the country preference. Triggers a one-
 * shot hydrate on first mount so the value persists across app boots.
 * Returns the full CountryConfig so call-sites don't have to look up
 * the catalogue separately.
 */
export const useCountry = (): UseCountryReturn => {
  const code = useCountryStore((s) => s.code);
  const hydrated = useCountryStore((s) => s.hydrated);
  const setCode = useCountryStore((s) => s.setCode);
  const hydrate = useCountryStore((s) => s.hydrate);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  return {
    code,
    config: COUNTRY_CATALOGUE[code],
    hydrated,
    setCode,
  };
};
