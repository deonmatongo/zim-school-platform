import { requireSession } from '@/lib/auth/getSession'
import { createClient } from '@/lib/supabase/server'
import { announcements as devAnnouncements } from '@/lib/dev/seed-data'
import { PageHeader } from '@/components/ui-custom/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/ui-custom/EmptyState'
import { Megaphone, Pin, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AnnouncementsPage() {
  const user = await requireSession()

  let announcements: any[]

  if (process.env.DEV_BYPASS === 'true') {
    const audienceFilters = ['all', user.role === 'parent' ? 'parents' : user.role === 'student' ? 'students' : user.role === 'teacher' ? 'teachers' : null].filter(Boolean)
    announcements = user.role === 'admin'
      ? devAnnouncements
      : devAnnouncements.filter(a => audienceFilters.includes(a.audience))
    announcements = [...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.created_at.localeCompare(a.created_at))
  } else {
    const supabase = createClient()
    const audienceFilters: ('all' | 'parents' | 'students' | 'teachers' | 'class' | 'grade')[] = ['all']
    if (user.role === 'parent') audienceFilters.push('parents')
    if (user.role === 'student') audienceFilters.push('students')
    if (user.role === 'teacher') audienceFilters.push('teachers')
    let query = supabase
      .from('announcements')
      .select('*, user_profiles(first_name, last_name)')
      .eq('school_id', user.schoolId)
      .eq('published', true)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (user.role !== 'admin') query = query.in('audience', audienceFilters)
    const { data } = await query
    announcements = data ?? []
  }

  const canCreate = ['admin', 'teacher'].includes(user.role)

  const audienceColors: Record<string, string> = {
    all: 'bg-gray-100 text-gray-700',
    parents: 'bg-green-100 text-green-700',
    students: 'bg-blue-100 text-blue-700',
    teachers: 'bg-purple-100 text-purple-700',
    class: 'bg-amber-100 text-amber-700',
    grade: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Announcements"
        description={`${announcements?.length ?? 0} active announcements`}
        action={
          canCreate && (
            <Link href="/dashboard/announcements/new" className={buttonVariants({ size: 'sm' })}>
              <Plus className="h-4 w-4 mr-1.5" /> New Announcement
            </Link>
          )
        }
      />

      {(announcements ?? []).length === 0 && (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="School announcements will appear here."
          action={canCreate && (
            <Link href="/dashboard/announcements/new" className={buttonVariants({ size: 'sm' })}>
              Create announcement
            </Link>
          )}
        />
      )}

      <div className="space-y-3">
        {(announcements ?? []).map((a: any) => (
          <Card key={a.id} className={a.pinned ? 'border-amber-200 bg-amber-50/30' : ''}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${a.pinned ? 'bg-amber-100' : 'bg-gray-100'}`}>
                  {a.pinned
                    ? <Pin className="h-4 w-4 text-amber-600" />
                    : <Megaphone className="h-4 w-4 text-gray-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{a.title}</h3>
                    {a.pinned && <Badge variant="outline" className="border-amber-300 text-amber-700 text-xs">Pinned</Badge>}
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${audienceColors[a.audience] ?? 'bg-gray-100 text-gray-700'}`}>
                      {a.audience}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{a.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {a.user_profiles?.first_name} {a.user_profiles?.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {a.expires_at && (
                      <>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">Expires {new Date(a.expires_at).toLocaleDateString('en-ZW')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
