'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { canAccess } from '@/lib/auth/roles'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  CalendarCheck, BookMarked, CreditCard, Megaphone,
  BarChart3, Settings, GraduationCap, School, ChevronRight,
} from 'lucide-react'

const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, feature: null },
      { href: '/dashboard/reports', label: 'Analytics', icon: BarChart3, feature: 'reports' },
    ],
  },
  {
    label: 'Academic',
    items: [
      { href: '/dashboard/students', label: 'Students', icon: Users, feature: 'students' },
      { href: '/dashboard/classes', label: 'Classes', icon: School, feature: 'classes' },
      { href: '/dashboard/subjects', label: 'Subjects', icon: BookOpen, feature: 'subjects' },
      { href: '/dashboard/assessments', label: 'Assessments', icon: ClipboardList, feature: 'marks' },
      { href: '/dashboard/marks', label: 'Mark Entry', icon: GraduationCap, feature: 'marks' },
      { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck, feature: 'attendance' },
      { href: '/dashboard/homework', label: 'Homework', icon: BookMarked, feature: 'homework' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/dashboard/fees', label: 'Fees', icon: CreditCard, feature: 'fees' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone, feature: 'announcements' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings, feature: 'settings' },
    ],
  },
]

interface MobileNavProps {
  open: boolean
  onClose: () => void
  schoolName: string
  primaryColor: string
}

export function MobileNav({ open, onClose, schoolName, primaryColor }: MobileNavProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const role = user?.role ?? 'student'

  const initials = schoolName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="left" className="w-72 p-0 border-0" style={{ background: 'var(--sidebar-bg)' }}>
        <SheetHeader className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
            >
              {initials}
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold text-white leading-tight">{schoolName}</SheetTitle>
              <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--sidebar-fg)' }}>{role}</p>
            </div>
          </div>
        </SheetHeader>

        <nav className="px-3 py-4 space-y-5 overflow-y-auto">
          {navSections.map(section => {
            const visible = section.items.filter(item =>
              item.feature === null || canAccess(role, item.feature)
            )
            if (visible.length === 0) return null
            return (
              <div key={section.label}>
                <p className="sidebar-section-label">{section.label}</p>
                <div className="space-y-0.5">
                  {visible.map(({ href, label, icon: Icon }) => {
                    const active = href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(href)
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={onClose}
                        className={cn('sidebar-nav-item group', active && 'active')}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-75 group-[.active]:opacity-100" />
                        <span className="flex-1">{label}</span>
                        {active && <ChevronRight className="h-3 w-3 opacity-60" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
