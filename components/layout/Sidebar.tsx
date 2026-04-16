'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { canAccess } from '@/lib/auth/roles'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  CalendarCheck, BookMarked, CreditCard, Megaphone,
  BarChart3, Settings, GraduationCap, School, ChevronRight, MessageCircle, UserCheck,
} from 'lucide-react'

const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, feature: null, roleLabel: {} },
      { href: '/dashboard/reports', label: 'Analytics', icon: BarChart3, feature: 'reports', roleLabel: {} },
    ],
  },
  {
    label: 'Academic',
    items: [
      { href: '/dashboard/students', label: 'Students', icon: Users, feature: 'students', roleLabel: {} },
      { href: '/dashboard/classes', label: 'Classes', icon: School, feature: 'classes', roleLabel: {} },
      { href: '/dashboard/subjects', label: 'Subjects', icon: BookOpen, feature: 'subjects', roleLabel: {} },
      { href: '/dashboard/assessments', label: 'Assessments', icon: ClipboardList, feature: 'assessments', roleLabel: {} },
      { href: '/dashboard/marks', label: 'Mark Entry', icon: GraduationCap, feature: 'marks', roleLabel: { parent: 'Marks', student: 'My Marks' } },
      { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck, feature: 'attendance', roleLabel: { student: 'My Attendance' } },
      { href: '/dashboard/homework', label: 'Homework', icon: BookMarked, feature: 'homework', roleLabel: {} },
      { href: '/dashboard/teacher-assignments', label: 'Teacher Assignments', icon: UserCheck, feature: 'teachers', roleLabel: {} },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/dashboard/fees', label: 'Fees', icon: CreditCard, feature: 'fees', roleLabel: {} },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone, feature: 'announcements', roleLabel: {} },
      { href: '/dashboard/messages',      label: 'Messages',      icon: MessageCircle, feature: 'messages', roleLabel: {} },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings, feature: 'settings', roleLabel: {} },
    ],
  },
]

export function Sidebar({ schoolName, primaryColor }: { schoolName: string; primaryColor: string }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const role = user?.role ?? 'student'

  const initials = schoolName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen shrink-0" style={{ background: 'var(--sidebar-bg)' }}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate">{schoolName}</p>
            <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--sidebar-fg)' }}>{role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-none">
        {navSections.map(section => {
          const visible = section.items.filter(item =>
            item.feature === null || canAccess(role, item.feature)
          )
          if (visible.length === 0) return null
          return (
            <div key={section.label}>
              <p className="sidebar-section-label">{section.label}</p>
              <div className="space-y-0.5">
                {visible.map(({ href, label, icon: Icon, roleLabel }) => {
                  const dashboardPaths = ['/dashboard/admin', '/dashboard/parent', '/dashboard/teacher', '/dashboard/student']
                  const active = href === '/dashboard'
                    ? pathname === '/dashboard' || dashboardPaths.some(p => pathname === p)
                    : pathname.startsWith(href) && !dashboardPaths.includes(pathname)
                  const displayLabel = (roleLabel as Record<string, string>)[role] ?? label
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn('sidebar-nav-item group', active && 'active')}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-75 group-[.active]:opacity-100" />
                      <span className="flex-1">{displayLabel}</span>
                      {active && <ChevronRight className="h-3 w-3 opacity-60" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Bottom user strip */}
      <div className="px-3 pb-4">
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
          style={{ background: 'var(--sidebar-hover-bg)' }}
        >
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: primaryColor }}
          >
            {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--sidebar-fg)' }}>{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
