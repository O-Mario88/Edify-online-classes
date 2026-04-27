import type { PlanKey } from '@/api/payments.api';
import { COUNTRY_CATALOGUE, type CountryCode } from '@/config/countries';

export interface PlanCopy {
  key: PlanKey;
  /** Short name shown on cards. */
  name: string;
  /** Audience label, e.g. "For independent learners". */
  audience: string;
  /** Optional cadence ("/month", "/term"). */
  cadence?: string;
  /** Three to six benefit bullets. */
  benefits: string[];
  /** Trust note rendered in small slate text under the CTA. */
  trustNote: string;
  /** What happens after payment is approved. */
  afterApproval: string;
  /** True when the plan has no monetary price (e.g. School OS). */
  contactSales?: boolean;
}

/**
 * Per-country prices per plan, in the local currency's base unit
 * (UGX shillings, KES shillings — both no-decimal currencies).
 * Plans where contactSales=true get the "Contact us" treatment in the
 * UI regardless of country.
 */
const PRICES: Record<PlanKey, Record<CountryCode, number | null>> = {
  free:           { UG: 0,      KE: 0      },
  learner_plus:   { UG: 25_000, KE: 750    },
  parent_premium: { UG: 35_000, KE: 1_050  },
  teacher_pro:    { UG: 50_000, KE: 1_500  },
  school_os:      { UG: null,   KE: null   },
  school_os_plus: { UG: null,   KE: null   },
};

export const PLAN_CATALOGUE: Record<PlanKey, PlanCopy> = {
  free: {
    key: 'free',
    name: 'Free',
    audience: 'For everyone',
    benefits: [
      'Browse teachers and courses',
      'Take one diagnostic',
      'Limited learning level report',
      'Limited free content',
      'Limited live sessions',
      'Basic Learning Passport',
    ],
    trustNote: 'No card needed. Always available.',
    afterApproval: 'Already active on every Maple account.',
  },
  learner_plus: {
    key: 'learner_plus',
    name: 'Learner Plus',
    audience: 'For independent students',
    cadence: '/month',
    benefits: [
      'Full study plan and progress tracking',
      'AI Study Buddy',
      'Guided Practice Labs',
      'Mastery Tracks',
      'Exam Simulator + Mistake Notebook',
      'Certificates and Learning Passport',
    ],
    trustNote: 'Cancel anytime. No automatic renewals on the pilot.',
    afterApproval: 'Premium learning unlocks across the app within a few minutes of approval.',
  },
  parent_premium: {
    key: 'parent_premium',
    name: 'Parent Premium',
    audience: 'For parents and guardians',
    cadence: '/month',
    benefits: [
      'Weekly Child Progress Brief',
      'Parent Confidence Report',
      'Visibility into teacher feedback',
      'Exam readiness reports per child',
      'Recommended parent actions',
      'Downloadable reports + School Match insights',
    ],
    trustNote: 'You can manage and cancel for each child separately.',
    afterApproval: 'Reports start appearing on next refresh; the next Weekly Brief lands the following Monday.',
  },
  teacher_pro: {
    key: 'teacher_pro',
    name: 'Teacher Pro',
    audience: 'For independent teachers',
    cadence: '/month',
    benefits: [
      'Public storefront and verified badge',
      'Paid live classes and courses',
      'AI lesson assistant',
      'Student analytics + earnings dashboard',
      'Project review earnings',
      'Standby teacher availability',
    ],
    trustNote: 'Maple keeps a transparent platform fee per the teacher agreement.',
    afterApproval: 'Storefront goes live and paid features unlock once the request is approved.',
  },
  school_os: {
    key: 'school_os',
    name: 'School OS',
    audience: 'For institutions',
    contactSales: true,
    benefits: [
      'Branded school portal',
      'Learner registration and timetable',
      'Attendance and assessments',
      'Digital report cards',
      'Parent communication',
      'School health dashboard',
    ],
    trustNote: 'We partner with a small number of pilot schools each term.',
    afterApproval: 'A Maple onboarding lead reaches out within two business days to scope the rollout.',
  },
  school_os_plus: {
    key: 'school_os_plus',
    name: 'School OS Plus',
    audience: 'For institutions ready to scale',
    contactSales: true,
    benefits: [
      'Risk alerts and intervention packs',
      'Institution health history',
      'Exam readiness analytics',
      'AI-generated leadership insights',
      'Impact comparison + advanced reports',
      'School Match visibility + admission CRM',
    ],
    trustNote: 'School OS Plus is invite-only during the early-access window.',
    afterApproval: 'You\'ll get an invite link to the early-access cohort within 24 hours of approval.',
  },
};

/** Resolve the localised price string for a plan in the given country. */
export const priceLabelFor = (key: PlanKey, country: CountryCode): string => {
  const plan = PLAN_CATALOGUE[key];
  if (plan.contactSales) return 'Contact us';
  if (key === 'free') return 'Free';
  const amount = PRICES[key][country];
  if (amount == null) return 'Contact us';
  const cfg = COUNTRY_CATALOGUE[country];
  return `${cfg.currency_prefix} ${amount.toLocaleString('en-US')}`;
};

/** Plans visible to the student-side payment screen. */
export const STUDENT_PLAN_KEYS: PlanKey[] = ['free', 'learner_plus'];

/** Plans visible to the parent-side payment screen. */
export const PARENT_PLAN_KEYS: PlanKey[] = ['free', 'parent_premium'];

/** Plans shown to teachers. */
export const TEACHER_PLAN_KEYS: PlanKey[] = ['teacher_pro'];

/** Plans shown to institution admins. */
export const INSTITUTION_PLAN_KEYS: PlanKey[] = ['school_os', 'school_os_plus'];
