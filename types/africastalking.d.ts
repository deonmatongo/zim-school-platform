declare module 'africastalking' {
  interface SMSRecipient {
    statusCode: number
    number: string
    status: string
    cost: string
    messageId: string
    messageParts: number
  }

  interface SMSSendResponse {
    SMSMessageData: {
      Message: string
      Recipients: SMSRecipient[]
    }
  }

  interface SMSService {
    send(options: {
      to: string[]
      message: string
      from?: string
      enqueue?: boolean
    }): Promise<SMSSendResponse>
  }

  interface AfricasTalkingInstance {
    SMS: SMSService
  }

  function AfricasTalking(options: { apiKey: string; username: string }): AfricasTalkingInstance
  export = AfricasTalking
}
