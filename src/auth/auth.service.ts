// src/auth/auth.service.ts
import * as bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"

import { Injectable, BadRequestException, ForbiddenException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"

import { accessJwtConfig, refreshJwtConfig } from "@agileoffice/config/jwt.config"
import { PhoneNumberInUseException } from "@agileoffice/core/exception/user/phone-number-in-use.exception"
import { UserNotFoundException } from "@agileoffice/core/exception/user/user-not-found.exception"
import { UpdateUserDto } from "@agileoffice/features/user/dto"
import { User } from "@agileoffice/features/user/entities"
import { MediaType, Prisma, PrismaService } from "@agileoffice/prisma"

import { UserService } from "../features/user/user.service"
import { LoginCredentialsDto } from "./dto/request/login-credentials.dto"
import { SignUpRequestDto } from "./dto/request/signup-request.dto"
import { LoginResponseDto } from "./dto/response/login-response.dto"
import { RefreshTokenResponseDto } from "./dto/response/refresh-token-response.dto"
import { InvalidRefreshTokenException } from "./exceptions/invalid-refresh-token.exception"
import { OtpService } from "./otp/otp.service"
import { AccessTokenPayload } from "./types/access-token-payload"
import { GetCurrentUserResponse } from "./types/get-current-user-response.type"
import { RefreshTokenPayload } from "./types/refresh-token-payload"
import { SignUpResponse } from "./types/signup-response"
import { getTokenExpirationDate } from "./util/getTokenExpirationDate"

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly userService: UserService
  ) {}

  async signup(dto: SignUpRequestDto): Promise<SignUpResponse> {
    const { phoneNumber, password, firstName, lastName, gender } = dto

    const existingUser = await this.prisma.user.findUnique({
      where: { phoneNumber }
    })
    if (existingUser) {
      throw new PhoneNumberInUseException()
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await this.prisma.user.create({
      data: {
        phoneNumber,
        hash: hashedPassword,
        firstName,
        lastName,
        isVerified: true,
        gender
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true
        // Include other fields if necessary
      }
    })

    // Generate and send OTP
    // await this.otpService.sendOtp(newUser.phoneNumber)

    return {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phoneNumber: newUser.phoneNumber
    }
  }

  /** Handles OTP verification and user activation */
  async verifyOtp(phoneNumber: string, otp: string): Promise<void> {
    try {
      await this.otpService.verifyOtp(phoneNumber, otp)
      await this.prisma.user.update({
        where: { phoneNumber },
        data: { isVerified: true }
      })
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message)
      }
      throw new BadRequestException("An unexpected error occurred during OTP verification")
    }
  }

  async resendOtp(phoneNumber: string): Promise<void> {
    const user = await this.userService.findByPhoneNumber(phoneNumber)

    if (user.isVerified) {
      throw new ForbiddenException("User is already verified")
    }

    await this.otpService.sendOtp(phoneNumber)
  }

  async login(dto: LoginCredentialsDto, browserInfo?: string): Promise<LoginResponseDto> {
    const { phoneNumber, password } = dto
    const user = await this.validateUser(phoneNumber, password)

    const payload: AccessTokenPayload = {
      id: user.id,
      phoneNumber: user.phoneNumber
    }

    const accessToken = await this.generateAccessToken(payload)
    const refreshToken = await this.createRefreshToken(payload, browserInfo)

    return {
      accessToken,
      refreshToken,
      access_token_expires: this.getTokenExpirationTime(accessToken)
    }
  }

  private async validateUser(phoneNumber: string, password: string): Promise<User> {
    const user = await this.userService.findByPhoneNumber(phoneNumber)

    const isPasswordValid = await bcrypt.compare(password, user.hash)
    if (!isPasswordValid) {
      throw new ForbiddenException("Invalid phone number or password")
    }

    if (!user.isVerified) {
      throw new ForbiddenException("Account is not verified")
    }

    return user
  }

  /** Generates an access token */
  private async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    const accessToken = await this.jwtService.signAsync(payload, accessJwtConfig)

    return accessToken
  }

  /** Generates a refresh token */
  private async createRefreshToken(
    payload: AccessTokenPayload,
    browserInfo?: string
  ): Promise<string> {
    let retries = 0
    const maxRetries = 5
    while (retries < maxRetries) {
      try {
        if (!payload.family) {
          payload.family = uuidV4()
        }

        const refreshToken = await this.jwtService.signAsync({ ...payload }, refreshJwtConfig)

        await this.saveRefreshToken({
          userId: payload.id,
          refreshToken,
          family: payload.family,
          browserInfo
        })

        return refreshToken
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          // Unique constraint failed, retry with a new UUID
          retries++
          console.warn(`Unique constraint violation, retrying... (${retries}/${maxRetries})`)
          if (retries === maxRetries) {
            console.error("Max retries reached, unable to save refresh token")
            throw error
          }
        } else {
          console.error("An unexpected error occurred:", error)
          throw error
        }
      }
    }

    throw new BadRequestException("Failed to create refresh token")
  }

  /** Saves a refresh token to the database */
  private async saveRefreshToken(refreshTokenCredentials: {
    userId: number
    refreshToken: string
    family: string
    browserInfo?: string
  }): Promise<void> {
    const expiresAt = getTokenExpirationDate(refreshJwtConfig.expiresIn)

    await this.prisma.userTokens.create({
      data: { ...refreshTokenCredentials, expiresAt }
    })
  }

  /** Refreshes tokens */
  async refreshToken(refreshToken: string, browserInfo?: string): Promise<RefreshTokenResponseDto> {
    let payload: RefreshTokenPayload
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: refreshJwtConfig.secret
      })
    } catch (error) {
      throw new InvalidRefreshTokenException()
    }

    const isValid = await this.validateRefreshToken(refreshToken, payload)
    if (!isValid) {
      throw new InvalidRefreshTokenException()
    }

    const newAccessToken = await this.generateAccessToken({
      id: payload.id,
      phoneNumber: payload.phoneNumber
    })
    const newRefreshToken = await this.rotateRefreshToken(refreshToken, payload, browserInfo)

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      access_token_expires: this.getTokenExpirationTime(newAccessToken)
    }
  }

  /** Validates the refresh token */
  private async validateRefreshToken(
    refreshToken: string,
    payload: RefreshTokenPayload
  ): Promise<boolean> {
    const tokenExists = await this.prisma.userTokens.findFirst({
      where: { refreshToken, userId: payload.id }
    })

    if (!tokenExists) {
      await this.removeRefreshTokenFamilyIfCompromised(payload.id, payload.family)
      return false
    }

    return true
  }

  /** Rotates the refresh token */
  private async rotateRefreshToken(
    refreshToken: string,
    payload: RefreshTokenPayload,
    browserInfo?: string
  ): Promise<string> {
    // Delete the old refresh token
    await this.prisma.userTokens.deleteMany({
      where: { refreshToken }
    })

    // Create a new refresh token
    const newRefreshToken = await this.createRefreshToken(payload, browserInfo)

    return newRefreshToken
  }

  /** Removes all refresh tokens in the same family if compromised */
  private async removeRefreshTokenFamilyIfCompromised(
    userId: number,
    tokenFamily?: string
  ): Promise<void> {
    if (!tokenFamily) return

    await this.prisma.userTokens.deleteMany({
      where: { userId, family: tokenFamily }
    })
  }

  /** Gets the current user's information */
  async getCurrentUser(userId: number): Promise<GetCurrentUserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
        // Include other fields if necessary
      }
    })

    if (!user) {
      throw new UserNotFoundException()
    }

    return user
  }

  /** Updates the current user's information */
  async updateCurrentUser(user: User, dto: UpdateUserDto): Promise<User> {
    const avatar = await this.prisma.media.create({
      data: {
        url: dto.avatarUrl,
        type: MediaType.IMAGE
      }
    })
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        phoneNumber: dto.phoneNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        avatar: {
          connect: {
            id: avatar.id
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        gender: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        hash: true,
        avatar: {
          select: {
            id: true,
            url: true
          }
        }
      }
    })

    return updatedUser
  }

  /** Handles forgot password functionality */
  async forgotPassword(phoneNumber: string): Promise<void> {
    const user = await this.userService.findByPhoneNumber(phoneNumber)

    if (!user.isVerified) {
      throw new ForbiddenException("User is not verified")
    }

    // Send OTP for password reset
    await this.otpService.sendOtp(user.phoneNumber)
  }

  /** Handles logout functionality */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return

    await this.prisma.userTokens.deleteMany({
      where: { refreshToken }
    })
  }

  /** Helper method to get access token expiry */
  private getTokenExpirationTime(token: string): Date {
    const decodedToken = this.jwtService.decode(token) as { exp: number }

    if (!decodedToken || !decodedToken.exp) {
      throw new BadRequestException("Invalid token")
    }

    const expiresAt = new Date(decodedToken.exp * 1000)

    return expiresAt
  }
}
