import { requireSession } from '@/lib/auth/getSession'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await requireSession()

  switch (user.role) {
    case 'admin':   redirect('/dashboard/admin')
    case 'teacher': redirect('/dashboard/teacher')
    case 'parent':  redirect('/dashboard/parent')
    case 'student': redirect('/dashboard/student')
    default:        redirect('/dashboard/admin')
  }
}
