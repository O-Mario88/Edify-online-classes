/**
 * Role-aware onboarding tour content.
 *
 * The first 60 seconds matter most — each role gets three tightly
 * worded steps that introduce the killer surfaces specific to them.
 * Copy is voicy and human, not feature-doc bullet points; the tone
 * matches the welcome screen and the brand voice.
 */
import type { Ionicons } from '@expo/vector-icons';

import type { TourTint } from './tints';

export interface TourStep {
  /** Ionicons glyph rendered in the hero disc. */
  icon: keyof typeof Ionicons.glyphMap;
  /** Tint family for the hero disc — same palette as FeatureLandingScreen. */
  tint: TourTint;
  /** Title shown big & bold. */
  title: string;
  /** One-paragraph summary under the title. */
  body: string;
}

export type TourRole = 'student' | 'parent' | 'teacher' | 'institution_admin';

export const TOURS: Record<TourRole, TourStep[]> = {
  student: [
    {
      icon: 'flash-outline',
      tint: 'navy',
      title: 'Today, in one glance',
      body: 'Open Maple and the most important thing for today is at the top — a class to join, an assignment due, or a "you\'re good" check. No hunting.',
    },
    {
      icon: 'sparkles-outline',
      tint: 'indigo',
      title: 'AI Study Buddy — hints, never answers',
      body: 'Stuck on a question? Ask the Study Buddy. It nudges you toward the answer instead of handing it over, and tells you when to talk to a real teacher.',
    },
    {
      icon: 'school-outline',
      tint: 'emerald',
      title: 'Live classes with real teachers',
      body: 'Join scheduled lessons, ask questions out loud, and pick up your Mistake Notebook afterwards. Maple is built around live teaching, not just videos.',
    },
  ],
  parent: [
    {
      icon: 'document-text-outline',
      tint: 'navy',
      title: 'Your weekly Brief',
      body: 'Every week, Maple writes one short paragraph about how your child is doing — strongest subject, attendance, the trend, and what to focus on next.',
    },
    {
      icon: 'ribbon-outline',
      tint: 'amber',
      title: 'Real evidence of progress',
      body: 'The Learning Passport collects badges, certificates, and reviewed projects. It\'s the receipts version of "how is school going?", and you can share it.',
    },
    {
      icon: 'mail-open-outline',
      tint: 'indigo',
      title: 'Schools reaching out',
      body: 'Once your child meets the bar, partner schools may invite them to apply, sit a placement, or visit. You always approve before contact details are shared.',
    },
  ],
  teacher: [
    {
      icon: 'people-outline',
      tint: 'navy',
      title: 'Your classes, calmly',
      body: 'Every class you teach lives on the home screen — students, schedule, and the next live session. Tap in to take roll, post resources, or run the lesson.',
    },
    {
      icon: 'create-outline',
      tint: 'emerald',
      title: 'Create + grade in one place',
      body: 'Build assessments from your phone, grade with rubrics, and leave audio feedback. Maple keeps every artefact in the learner\'s passport for you.',
    },
    {
      icon: 'analytics-outline',
      tint: 'indigo',
      title: 'See how it\'s landing',
      body: 'Reports show which topics stuck and which need a second pass. The data flows from the same lessons you taught — no extra paperwork.',
    },
  ],
  institution_admin: [
    {
      icon: 'sparkles-outline',
      tint: 'navy',
      title: 'Recommended learners',
      body: 'Maple surfaces students whose verified track record matches your admission profile — academic average, improvement trend, exam readiness — with parent consent.',
    },
    {
      icon: 'paper-plane-outline',
      tint: 'amber',
      title: 'Reach parents, with permission',
      body: 'Send invitations to apply, interview, sit a placement, or offer a scholarship. Parent contact details are revealed only once they accept.',
    },
    {
      icon: 'trophy-outline',
      tint: 'emerald',
      title: 'Scholarships + tier perks',
      body: 'Post scholarship opportunities and unlock invitation quotas with School OS Pro or Premium. Your dashboard shows what\'s included on your current plan.',
    },
  ],
};
