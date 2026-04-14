import { createAdminClient } from '@/lib/supabase/admin'
import { sendSms, normaliseZimPhone } from '@/lib/notifications/sms'
import { sendEmail, feeReminderHtml } from '@/lib/notifications/email'
import { getStudentBalance } from './fees'
import { formatMoney } from '@/lib/utils/fees'

const admin = createAdminClient()

async function getParentContacts(studentId: string) {
  const { data } = await admin
    .from('parent_student')
    .select('parent_id, user_profiles(phone, sms_opt_in, first_name, last_name)')
    .eq('student_id', studentId)

  return (data ?? []).map(row => {
    const profile = row.user_profiles as unknown as {
      phone: string | null
      sms_opt_in: boolean
      first_name: string
      last_name: string
    } | null
    return {
      parentId: row.parent_id,
      phone: profile?.phone ?? null,
      smsOptIn: profile?.sms_opt_in ?? false,
      name: profile ? `${profile.first_name} ${profile.last_name}` : 'Parent',
    }
  })
}

async function getStudentInfo(studentId: string) {
  const { data } = await admin
    .from('students')
    .select('first_name, last_name, school_id, schools(name, ecocash_number)')
    .eq('id', studentId)
    .single()
  return data
}

/**
 * Send fee reminder SMS + email to all opted-in parents of a student.
 */
export async function sendFeeReminder(studentId: string): Promise<void> {
  const [student, parents] = await Promise.all([
    getStudentInfo(studentId),
    getParentContacts(studentId),
  ])

  if (!student) return

  const school = student.schools as unknown as { name: string; ecocash_number: string | null } | null
  const schoolName = school?.name ?? 'School'

  // Get current academic year balance
  const { data: currentYear } = await admin
    .from('academic_years')
    .select('id')
    .eq('school_id', student.school_id)
    .eq('is_current', true)
    .single()

  if (!currentYear) return

  const balance = await getStudentBalance(studentId, currentYear.id)
  if (balance.balance <= 0) return

  const studentName = `${student.first_name} ${student.last_name}`
  const amountStr = formatMoney(balance.balance, balance.currency)
  const message = `${schoolName}: ${studentName} has an outstanding fee balance of ${amountStr}. Please settle promptly. EcoCash: ${school?.ecocash_number ?? 'N/A'}`

  const smsTargets = parents
    .filter(p => p.smsOptIn && p.phone)
    .map(p => normaliseZimPhone(p.phone!))

  if (smsTargets.length > 0) {
    await sendSms(smsTargets, message)
  }
}

/**
 * Send absence alert SMS to opted-in parents.
 */
export async function sendAbsenceAlert(studentId: string, date: string): Promise<void> {
  const [student, parents] = await Promise.all([
    getStudentInfo(studentId),
    getParentContacts(studentId),
  ])

  if (!student) return

  const school = student.schools as unknown as { name: string } | null
  const schoolName = school?.name ?? 'School'
  const studentName = `${student.first_name} ${student.last_name}`
  const message = `${schoolName}: ${studentName} was marked absent on ${date}. Please contact the school if this was unexpected.`

  const smsTargets = parents
    .filter(p => p.smsOptIn && p.phone)
    .map(p => normaliseZimPhone(p.phone!))

  if (smsTargets.length > 0) {
    await sendSms(smsTargets, message)
  }
}

/**
 * Notify parents that marks have been entered for an assessment.
 */
export async function sendMarkNotification(
  studentId: string,
  assessmentId: string
): Promise<void> {
  const [student, parents] = await Promise.all([
    getStudentInfo(studentId),
    getParentContacts(studentId),
  ])

  if (!student) return

  const { data: assessment } = await admin
    .from('assessments')
    .select('title, subjects(name)')
    .eq('id', assessmentId)
    .single()

  if (!assessment) return

  const subjectName = (assessment.subjects as unknown as { name: string } | null)?.name ?? 'a subject'
  const school = student.schools as unknown as { name: string } | null
  const schoolName = school?.name ?? 'School'
  const studentName = `${student.first_name} ${student.last_name}`
  const message = `${schoolName}: Marks for ${studentName}'s ${assessment.title} (${subjectName}) are now available in the parent portal.`

  const smsTargets = parents
    .filter(p => p.smsOptIn && p.phone)
    .map(p => normaliseZimPhone(p.phone!))

  if (smsTargets.length > 0) {
    await sendSms(smsTargets, message)
  }
}

/**
 * Bulk SMS broadcast for an announcement to its target audience.
 */
export async function sendAnnouncementSms(announcementId: string): Promise<void> {
  const { data: announcement } = await admin
    .from('announcements')
    .select('*, schools(name)')
    .eq('id', announcementId)
    .single()

  if (!announcement) return

  const schoolName = (announcement.schools as unknown as { name: string } | null)?.name ?? 'School'
  const message = `${schoolName}: ${announcement.title}. ${announcement.body}`.slice(0, 160)

  // Resolve recipient phone numbers based on audience
  let phoneNumbers: string[] = []

  if (['all', 'parents'].includes(announcement.audience)) {
    const { data: profiles } = await admin
      .from('user_profiles')
      .select('phone')
      .eq('school_id', announcement.school_id)
      .eq('role', 'parent')
      .eq('sms_opt_in', true)
      .not('phone', 'is', null)

    phoneNumbers = (profiles ?? []).map(p => normaliseZimPhone(p.phone!))
  }

  if (['all', 'teachers'].includes(announcement.audience)) {
    const { data: profiles } = await admin
      .from('user_profiles')
      .select('phone')
      .eq('school_id', announcement.school_id)
      .eq('role', 'teacher')
      .eq('sms_opt_in', true)
      .not('phone', 'is', null)

    phoneNumbers.push(...(profiles ?? []).map(p => normaliseZimPhone(p.phone!)))
  }

  if (announcement.audience === 'class' && announcement.target_class_id) {
    // Parents of students in this class
    const { data: students } = await admin
      .from('students')
      .select('id')
      .eq('class_id', announcement.target_class_id)

    const studentIds = (students ?? []).map(s => s.id)

    if (studentIds.length > 0) {
      const { data: parentLinks } = await admin
        .from('parent_student')
        .select('user_profiles(phone, sms_opt_in)')
        .in('student_id', studentIds)

      phoneNumbers = (parentLinks ?? [])
        .map(l => l.user_profiles as unknown as { phone: string | null; sms_opt_in: boolean } | null)
        .filter(p => p?.sms_opt_in && p?.phone)
        .map(p => normaliseZimPhone(p!.phone!))
    }
  }

  if (phoneNumbers.length > 0) {
    // Send in batches of 50
    for (let i = 0; i < phoneNumbers.length; i += 50) {
      await sendSms(phoneNumbers.slice(i, i + 50), message)
    }
  }
}
