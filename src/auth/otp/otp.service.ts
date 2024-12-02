import * as bcrypt from "bcrypt"
import { addMinutes, isAfter } from "date-fns"
import { PrismaService } from "src/prisma/prisma.service"

import { Injectable, Logger } from "@nestjs/common"

import {
  InvalidOtpException,
  MaxOtpAttemptsExceededException,
  OtpExpiredException
} from "../exceptions/otp.exception"
import { TwilioService } from "./twilio.service"

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name)
  private readonly OTP_LENGTH = 6
  private readonly OTP_EXPIRATION_MINUTES = 10
  private readonly MAX_ATTEMPTS = 5

  constructor(
    private prisma: PrismaService,
    private readonly twilioService: TwilioService // Twilio provider
  ) {}

  /** Generates a random OTP code */
  private generateOtp(): string {
    let otp = ""
    for (let i = 0; i < this.OTP_LENGTH; i++) {
      otp += Math.floor(Math.random() * 10).toString()
    }
    return otp
  }

  /** Formats the phone number to E.164 format for Vietnam */
  private formatPhoneNumber(phoneNumber: string): string {
    const cleanedNumber = phoneNumber.replace(/\D/g, "") // Remove non-digit characters
    if (cleanedNumber.startsWith("0")) {
      return `+84${cleanedNumber.slice(1)}` // Replace leading '0' with Vietnam country code
    }
    if (cleanedNumber.startsWith("84")) {
      return `+${cleanedNumber}` // Ensure the number starts with '+'
    }
    throw new Error(`Invalid phone number: ${phoneNumber}`)
  }

  /** Sends OTP via Twilio */
  async sendOtp(phoneNumber: string): Promise<void> {
    await this.prisma.otp.deleteMany({
      where: { phoneNumber }
    })

    const otpCode = this.generateOtp()
    const expiresAt = addMinutes(new Date(), this.OTP_EXPIRATION_MINUTES)

    const hashedOtp = await bcrypt.hash(otpCode, 10)

    await this.prisma.otp.create({
      data: {
        phoneNumber,
        code: hashedOtp,
        expiresAt
      }
    })

    const formattedPhone = this.formatPhoneNumber(phoneNumber)

    try {
      await this.twilioService.sendSms(
        formattedPhone,
        `Your verification code is ${otpCode}. It will expire in ${this.OTP_EXPIRATION_MINUTES} minutes.`
      )
      this.logger.log(`Sent OTP ${otpCode} to ${formattedPhone}`)
    } catch (error) {
      this.logger.error(`Failed to send OTP: ${error.message}`)
      throw new Error("Failed to send OTP. Please try again.")
    }
  }

  /** Verifies the provided OTP */
  async verifyOtp(phoneNumber: string, otp: string): Promise<void> {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { phoneNumber },
      orderBy: { createdAt: "desc" }
    })

    if (!otpRecord) {
      throw new InvalidOtpException()
    }

    if (isAfter(new Date(), otpRecord.expiresAt)) {
      throw new OtpExpiredException()
    }

    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      throw new MaxOtpAttemptsExceededException()
    }

    const isOtpValid = await bcrypt.compare(otp, otpRecord.code)

    if (!isOtpValid) {
      await this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } }
      })
      throw new InvalidOtpException()
    }

    await this.prisma.otp.delete({
      where: { id: otpRecord.id }
    })
  }
}
