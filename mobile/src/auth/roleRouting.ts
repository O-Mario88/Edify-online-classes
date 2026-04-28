/**
 * Role → home route mapping. Drives the post-login redirect and the
 * route guard in app/_layout.tsx.
 */
export type Role =
  | 'student' | 'universal_student' | 'institution_student'
  | 'teacher' | 'independent_teacher' | 'institution_teacher'
  | 'parent'
  | 'institution_admin'
  | 'admin' | 'platform_admin';

export function homeRouteForRole(role: string | undefined | null): string {
  const r = (role || '').toLowerCase();
  if (r === 'parent')                return '/(parent)';
  if (r.includes('teacher'))         return '/(teacher)';
  // institution_admin, head-teacher, DOS — anything school-side that
  // isn't a learner or a teacher routes to the institution dashboard.
  if (r.includes('institution') ||
      r === 'admin' || r === 'platform_admin') {
    return '/(institution)';
  }
  return '/(student)';
}
