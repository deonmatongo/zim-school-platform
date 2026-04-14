import { NextRequest } from 'next/server'
import { SmsSchema, FeeReminderSchema, AbsenceAlertSchema, BulkSmsSchema } from '@/lib/validators/notification'
import { sendSms, normaliseZimPhone } from '@/lib/notifications/sms'
import { sendFeeReminder, sendAbsenceAlert, sendAnnouncementSms } from '@/lib/services/notifications'
import { getRouteContext, parseBody, apiSuccess, apiError, requireRole } from '@/lib/api-helpers'
import { z } from 'zod'

const NotificationRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('custom'), to: z.array(z.string()).min(1), message: z.string().min(1).max(160) }),
  z.object({ type: z.literal('fee_reminder'), student_id: z.string().uuid() }),
  z.object({ type: z.literal('absence_alert'), student_id: z.string().uuid(), date: z.string().date() }),
  z.object({ type: z.literal('announcement'), announcement_id: z.string().uuid() }),
])

export async function POST(request: NextRequest) {
  const ctx = getRouteContext(request)
  if (!ctx) return apiError('Unauthorised', 401)

  const roleCheck = requireRole(ctx.role, ['admin'])
  if (roleCheck) return roleCheck

  const parsed = await parseBody(request, NotificationRequestSchema)
  if ('response' in parsed) return parsed.response

  const body = parsed.data

  try {
    switch (body.type) {
      case 'custom': {
        const normalisedNumbers = body.to.map(n => normaliseZimPhone(n))
        const result = await sendSms(normalisedNumbers, body.message)
        return apiSuccess(result)
      }

      case 'fee_reminder': {
        await sendFeeReminder(body.student_id)
        return apiSuccess({ sent: true })
      }

      case 'absence_alert': {
        await sendAbsenceAlert(body.student_id, body.date)
        return apiSuccess({ sent: true })
      }

      case 'announcement': {
        await sendAnnouncementSms(body.announcement_id)
        return apiSuccess({ sent: true })
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'SMS send failed'
    return apiError(msg)
  }
}
