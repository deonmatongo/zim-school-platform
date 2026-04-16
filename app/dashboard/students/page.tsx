'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { DataTable, Column } from '@/components/ui-custom/DataTable'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { studentsApi, classesApi } from '@/lib/api/client'
import { UserPlus, Search, Download, Eye, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface Student {
  id: string
  first_name: string
  last_name: string
  reg_number: string
  gender: 'M' | 'F' | null
  boarding: boolean
  active: boolean
  fee_status?: string
  attendance_pct?: number
  parent_contact?: string
  classes: { id?: string; name: string; grades: { name: string } | null } | null
}

const AVATAR_COLORS = [
  { bg: 'bg-blue-100',    text: 'text-blue-700' },
  { bg: 'bg-violet-100',  text: 'text-violet-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-amber-100',   text: 'text-amber-700' },
  { bg: 'bg-rose-100',    text: 'text-rose-700' },
  { bg: 'bg-cyan-100',    text: 'text-cyan-700' },
]

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

function FeeStatusPill({ status }: { status?: string }) {
  if (!status) return <span className="text-slate-400 text-xs">—</span>
  const s = status.toLowerCase()
  if (s === 'cleared' || s === 'paid') return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Cleared
    </span>
  )
  if (s === 'partial') return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Partial
    </span>
  )
  if (s === 'overdue') return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />Overdue
    </span>
  )
  return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>
}

export default function StudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [classId, setClassId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    Promise.all([studentsApi.list(), classesApi.list()]).then(([s, c]) => {
      setStudents((s.data as Student[]) ?? [])
      setClasses((c.data as any[]) ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = students.filter(s => {
    const matchQ = !q || `${s.first_name} ${s.last_name} ${s.reg_number}`.toLowerCase().includes(q.toLowerCase())
    const matchClass = !classId || (s.classes as any)?.id === classId
    const matchStatus = !statusFilter || s.fee_status?.toLowerCase() === statusFilter
    return matchQ && matchClass && matchStatus
  })

  const columns: Column<Student>[] = [
    {
      key: 'reg',
      header: 'Reg No.',
      cell: (s) => (
        <span className="text-xs text-slate-400 font-mono tabular-nums">{s.reg_number}</span>
      ),
    },
    {
      key: 'name',
      header: 'Student',
      cell: (s) => {
        const c = getAvatarColor(s.first_name)
        return (
          <div className="flex items-center gap-3">
            <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', c.bg, c.text)}>
              {s.first_name[0]}{s.last_name[0]}
            </div>
            <span className="font-semibold text-slate-800">{s.first_name} {s.last_name}</span>
          </div>
        )
      },
    },
    {
      key: 'class',
      header: 'Class',
      cell: (s) => (
        <span className="text-slate-600">{(s.classes as any)?.name ?? '—'}</span>
      ),
    },
    {
      key: 'contact',
      header: 'Parent Contact',
      cell: (s) => (
        <span className="text-slate-500 text-sm">{s.parent_contact ?? '—'}</span>
      ),
      className: 'hidden lg:table-cell',
    },
    {
      key: 'fees',
      header: 'Fees',
      cell: (s) => <FeeStatusPill status={s.fee_status} />,
      className: 'hidden md:table-cell',
    },
    {
      key: 'attendance',
      header: 'Attendance',
      cell: (s) => {
        const pct = s.attendance_pct
        if (pct == null) return <span className="text-slate-400 text-xs">—</span>
        const color = pct >= 90 ? 'text-emerald-600' : pct >= 75 ? 'text-amber-600' : 'text-red-500'
        return <span className={cn('font-semibold text-sm tabular-nums', color)}>{pct}%</span>
      },
      className: 'hidden md:table-cell',
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (s) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/dashboard/students/${s.id}`}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link
                href={`/dashboard/students/${s.id}/edit`}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
              <button
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description={`${filtered.length} enrolled students`}
        action={
          <>
            <Button variant="outline" size="sm" className="gap-2 text-slate-600 border-slate-200 hover:border-slate-300">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            {user?.role === 'admin' && (
              <Link
                href="/dashboard/students/new"
                className={buttonVariants({ size: 'sm' })}
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Enrol Student
              </Link>
            )}
          </>
        }
      />

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by name or reg number…"
              className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-xl text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Class filter */}
          <select
            value={classId}
            onChange={e => setClassId(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors min-w-[140px]"
          >
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="cleared">Cleared</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} rowKey={(s) => s.id} />
    </div>
  )
}
