export type Role = 'admin' | 'teacher' | 'parent' | 'student'

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  teacher: 'Teacher',
  parent: 'Parent / Guardian',
  student: 'Student',
}

export const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-800',
  teacher: 'bg-blue-100 text-blue-800',
  parent: 'bg-green-100 text-green-800',
  student: 'bg-amber-100 text-amber-800',
}

export function canAccess(role: Role, feature: string): boolean {
  const matrix: Record<string, Role[]> = {
    students: ['admin', 'teacher'],
    classes: ['admin', 'teacher'],
    subjects: ['admin', 'teacher'],
    assessments: ['admin', 'teacher'],
    marks: ['admin', 'teacher', 'parent', 'student'],
    attendance: ['admin', 'teacher', 'parent', 'student'],
    homework: ['admin', 'teacher', 'parent', 'student'],
    fees: ['admin', 'parent'],
    'fees.write': ['admin'],
    announcements: ['admin', 'teacher', 'parent', 'student'],
    'announcements.write': ['admin', 'teacher'],
    messages: ['admin', 'teacher', 'parent', 'student'],
    reports: ['admin', 'teacher'],
    settings: ['admin'],
    teachers: ['admin'],
  }
  return matrix[feature]?.includes(role) ?? false
}
