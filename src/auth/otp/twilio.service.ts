import { Twilio } from "twilio"

import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name)
  private twilioClient: Twilio

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>("TWILIO_ACCOUNT_SID")
    const authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN")
    const fromPhoneNumber = this.configService.get<string>("TWILIO_PHONE_NUMBER")

    if (!accountSid || !authToken || !fromPhoneNumber) {
      throw new Error("Twilio configuration is missing!")
    }

    this.twilioClient = new Twilio(accountSid, authToken)
  }

  /** Sends an SMS using Twilio */
  async sendSms(to: string, body: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body,
        from: this.configService.get<string>("TWILIO_PHONE_NUMBER"),
        to
      })
      this.logger.log(`SMS sent to ${to}`)
    } catch (error) {
      this.logger.error(`Error sending SMS to ${to}: ${error.message}`)
      throw error
    }
  }
}
