import { requireRole } from '@/lib/auth/getSession'
import { createClient } from '@/lib/supabase/server'
import { FormCard, FormSection, FormDivider } from '@/components/ui-custom/FormShell'
import { SchoolSettingsForm } from './SchoolSettingsForm'
import { BrandingForm } from './BrandingForm'

export default async function SettingsPage() {
  const user = await requireRole(['admin'])
  const supabase = createClient()

  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('id', user.schoolId)
    .single()

  const { data: academicYears } = await supabase
    .from('academic_years')
    .select('*')
    .eq('school_id', user.schoolId)
    .order('year', { ascending: false })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">School Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your school profile and configuration.</p>
      </div>

      <FormCard>
        <div className="px-6 py-4 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">School Profile</p>
        </div>
        <div className="px-6 py-5">
          <SchoolSettingsForm school={school} />
        </div>
      </FormCard>

      <FormCard>
        <div className="px-6 py-4 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Branding</p>
          <p className="text-xs text-slate-400 mt-0.5">Logo, colours, fonts, and document settings. Saved locally until connected to the database.</p>
        </div>
        <div className="px-6 py-5">
          <BrandingForm />
        </div>
      </FormCard>

      <FormCard>
        <div className="px-6 py-4 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Academic Years</p>
        </div>
        {(academicYears ?? []).length === 0 ? (
          <p className="text-sm text-slate-400 py-10 text-center">No academic years configured.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {(academicYears ?? []).map((y: any) => (
              <div key={y.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{y.year} — Term {y.term}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(y.start_date).toLocaleDateString('en-ZW')} → {new Date(y.end_date).toLocaleDateString('en-ZW')}
                  </p>
                </div>
                {y.is_current && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </FormCard>
    </div>
  )
}
