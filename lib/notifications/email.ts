import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!)
  }
  return _resend
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

/**
 * Send a transactional email via Resend.
 */
export async function sendEmail(opts: EmailOptions): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] Resend API key not configured')
    return { success: false, error: 'Email not configured' }
  }

  const from = opts.from ?? `noreply@${process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost'}`

  try {
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    })

    if (error) return { success: false, error: error.message }
    return { success: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    console.error('[Email] Error:', message)
    return { success: false, error: message }
  }
}

export function feeReminderHtml(
  schoolName: string,
  studentName: string,
  balance: number,
  currency: string,
  dueDate: string
): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1a5276;">${schoolName}</h2>
  <p>Dear Parent/Guardian,</p>
  <p>This is a reminder that the following fee payment is outstanding for <strong>${studentName}</strong>:</p>
  <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
    <tr style="background:#f2f3f4;">
      <td style="padding:8px; border:1px solid #ddd;">Outstanding Balance</td>
      <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">${currency} ${balance.toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #ddd;">Due Date</td>
      <td style="padding:8px; border:1px solid #ddd;">${dueDate}</td>
    </tr>
  </table>
  <p>Please ensure payment is made promptly to avoid disruption to your child's education.</p>
  <p>Thank you for your continued support.</p>
  <hr/>
  <p style="font-size: 12px; color: #888;">${schoolName} — Powered by ZimSchoolPlatform</p>
</div>`
}
