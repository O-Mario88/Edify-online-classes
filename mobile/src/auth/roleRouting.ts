/**
 * Role → home route mapping. Drives the post-login redirect and the
 * route guard in app/_layout.tsx.
 *
 * Phase 1 only includes (student); other role groups land on /(student)
 * temporarily until their tabs are built.
 */
export type Role =
  | 'student' | 'universal_student' | 'institution_student'
  | 'teacher' | 'independent_teacher' | 'institution_teacher'
  | 'parent'
  | 'institution_admin'
  | 'admin' | 'platform_admin';

export function homeRouteForRole(role: string | undefined | null): string {
  const r = (role || '').toLowerCase();
  if (r === 'parent')            return '/(parent)';    // Phase 3 ✓
  if (r.includes('teacher'))     return '/(student)';   // placeholder: teacher tabs land in Phase 4
  if (r.includes('institution')) return '/(student)';   // placeholder
  if (r.includes('admin'))       return '/(student)';   // platform admin stays web-first
  return '/(student)';
}
