/**
 * Stage helpers for the Primary (P4–P7) / Secondary (S1–S6) split.
 *
 * Pulls the stage from whichever field the session user has: the
 * canonical `stage` (written at registration), the legacy demo-only
 * `school_level`, or the institution's `school_level` for institution
 * members. Defaults to 'secondary' since that's where existing content
 * lives.
 */

export type UserStage = 'primary' | 'secondary';

export function getUserStage(user: any): UserStage {
  const raw =
    user?.stage
    ?? user?.school_level
    ?? user?.institution?.school_level
    ?? 'secondary';
  return raw === 'primary' ? 'primary' : 'secondary';
}

export function isPrimary(user: any): boolean {
  return getUserStage(user) === 'primary';
}

export function isSecondary(user: any): boolean {
  return getUserStage(user) === 'secondary';
}

/**
 * Labels for stage badges, headers, etc.
 */
export function stageLabel(stage: UserStage): string {
  return stage === 'primary' ? 'Primary (P4 – P7)' : 'Secondary (S1 – S6)';
}

export function stageEmoji(stage: UserStage): string {
  return stage === 'primary' ? '🧒' : '🎓';
}
