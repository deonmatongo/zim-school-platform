'use client'

import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LogOut, User, Menu, Bell, MapPin, ChevronDown } from 'lucide-react'
import { MobileNav } from './MobileNav'
import { useState } from 'react'

interface HeaderProps {
  schoolName: string
  primaryColor: string
}

export function Header({ schoolName, primaryColor }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '??'

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 shadow-sm">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-slate-600"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* School badge (desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)` }}
          >
            {schoolName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">{schoolName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-2.5 w-2.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Harare</span>
            </div>
          </div>
        </div>

        {/* Mobile school name */}
        <span className="lg:hidden text-sm font-semibold text-slate-800">{schoolName}</span>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Welcome text */}
          <div className="hidden md:block text-right mr-1">
            <p className="text-xs text-slate-400">{greeting},</p>
            <p className="text-sm font-semibold text-slate-700">{user?.firstName ? `${user.role === 'teacher' ? 'Mr/Mrs' : ''} ${user.firstName} ${user.lastName}`.trim() : 'User'}</p>
          </div>

          {/* Notifications */}
          <button className="relative h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 pl-1 pr-2 py-1 hover:bg-slate-50 transition-colors rounded-2xl">
              <Avatar className="h-8 w-8 ring-2 ring-offset-1 ring-slate-200">
                <AvatarImage src={user?.avatarUrl ?? undefined} />
                <AvatarFallback
                  className="text-white text-xs font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 shadow-lg border-slate-100">
              <DropdownMenuLabel className="font-normal py-3">
                <p className="text-sm font-semibold text-slate-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 capitalize">{user?.role}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem render={<a href="/dashboard/settings" />} className="gap-2 text-slate-600">
                <User className="h-4 w-4" /> Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem onClick={signOut} className="gap-2 text-red-500 focus:text-red-600 focus:bg-red-50">
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        schoolName={schoolName}
        primaryColor={primaryColor}
      />
    </>
  )
}
