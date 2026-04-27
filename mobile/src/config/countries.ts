/**
 * Country catalogue for the launch markets. Drives:
 *   - Country picker on auth surfaces
 *   - Currency rendering across the plan catalogue
 *   - Curriculum + exam-track labels on role homes
 *   - Payment method chip set (mobile money first)
 *
 * Adding a new country: append a CountryConfig and update the currency
 * helpers + plan price tables. Everything else is wired off these
 * fields.
 */

export type CountryCode = 'UG' | 'KE';

export interface PaymentMethodOption {
  /** Backend key. Must match `pilot_payments.UpgradeRequest.METHOD_CHOICES`. */
  key: 'mtn_momo' | 'airtel_money' | 'mpesa' | 'cash' | 'other';
  label: string;
  hint: string;
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  /** Pictographic flag emoji used on chips. */
  flag: string;
  /** Default curriculum framework label for the country. */
  curriculum: string;
  /** Examples shown in onboarding copy ("PLE for primary, UCE for secondary"). */
  exam_tracks: { primary: string; secondary: string };
  /** ISO 4217 currency code. */
  currency: string;
  /** Currency display prefix used on plan cards. */
  currency_prefix: string;
  /** Default payment methods listed first on the upgrade sheet. */
  payment_methods: PaymentMethodOption[];
  /** Local helpline / support phone (text, not clickable). */
  support_phone?: string;
}

const MTN_UG: PaymentMethodOption = { key: 'mtn_momo',     label: 'MTN MoMo',     hint: 'Mobile Money on MTN Uganda' };
const AIRTEL_UG: PaymentMethodOption = { key: 'airtel_money', label: 'Airtel Money', hint: 'Airtel Money Uganda' };
const MPESA_KE: PaymentMethodOption = { key: 'mpesa',       label: 'M-Pesa',       hint: 'Safaricom M-Pesa' };
const AIRTEL_KE: PaymentMethodOption = { key: 'airtel_money', label: 'Airtel Money', hint: 'Airtel Money Kenya' };
const CASH: PaymentMethodOption = { key: 'cash',        label: 'Cash / Bank',  hint: 'In-person or bank transfer' };
const OTHER: PaymentMethodOption = { key: 'other',       label: 'Other',        hint: 'Tell us in the note' };

export const COUNTRY_CATALOGUE: Record<CountryCode, CountryConfig> = {
  UG: {
    code: 'UG',
    name: 'Uganda',
    flag: '🇺🇬',
    curriculum: 'NCDC',
    exam_tracks: { primary: 'PLE', secondary: 'UCE / UACE' },
    currency: 'UGX',
    currency_prefix: 'UGX',
    payment_methods: [MTN_UG, AIRTEL_UG, CASH, OTHER],
    support_phone: '+256 700 000 000',
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    curriculum: 'KICD / CBC',
    exam_tracks: { primary: 'KCPE / KPSEA', secondary: 'KCSE' },
    currency: 'KES',
    currency_prefix: 'KES',
    payment_methods: [MPESA_KE, AIRTEL_KE, CASH, OTHER],
    support_phone: '+254 700 000 000',
  },
};

/** All supported countries in display order. */
export const SUPPORTED_COUNTRIES: CountryConfig[] = [COUNTRY_CATALOGUE.UG, COUNTRY_CATALOGUE.KE];

/** Default country if none has been selected (matches the pilot user base). */
export const DEFAULT_COUNTRY: CountryCode = 'UG';

/** Format a price for the given country with proper grouping. */
export const formatLocalPrice = (amount: number, code: CountryCode): string => {
  const cfg = COUNTRY_CATALOGUE[code];
  const grouped = amount.toLocaleString('en-US');
  return `${cfg.currency_prefix} ${grouped}`;
};
