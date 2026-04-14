import AfricasTalking from 'africastalking'

let _client: ReturnType<typeof AfricasTalking> | null = null

function getClient() {
  if (!_client) {
    _client = AfricasTalking({
      apiKey: process.env.AFRICASTALKING_API_KEY!,
      username: process.env.AFRICASTALKING_USERNAME!,
    })
  }
  return _client
}

export interface SmsResult {
  success: boolean
  messageId?: string
  recipients?: number
  error?: string
}

/**
 * Send SMS to one or more Zimbabwean phone numbers via Africa's Talking.
 * Numbers should be in international format: +263771234567
 */
export async function sendSms(to: string[], message: string): Promise<SmsResult> {
  if (!process.env.AFRICASTALKING_API_KEY || !process.env.AFRICASTALKING_USERNAME) {
    console.warn('[SMS] Africa\'s Talking credentials not configured')
    return { success: false, error: 'SMS not configured' }
  }

  try {
    const sms = getClient().SMS
    const result = await sms.send({
      to,
      message,
      from: process.env.AFRICASTALKING_SENDER_ID ?? undefined,
    })

    const recipients = result.SMSMessageData?.Recipients ?? []
    const successCount = recipients.filter((r: { status: string }) => r.status === 'Success').length

    return {
      success: successCount > 0,
      recipients: successCount,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown SMS error'
    console.error('[SMS] Error:', message)
    return { success: false, error: message }
  }
}

/**
 * Normalise a Zimbabwean phone number to +263 format.
 * Handles: 0771234567, 263771234567, +263771234567
 */
export function normaliseZimPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('263')) return `+${digits}`
  if (digits.startsWith('0')) return `+263${digits.slice(1)}`
  return `+263${digits}`
}
