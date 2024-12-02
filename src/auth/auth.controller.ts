// src/auth/auth.controller.ts
import { Response as ResponseType, Request as RequestType } from "express"

import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  HttpException
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBody } from "@nestjs/swagger"

import { Public } from "@agileoffice/core/decorator/public.decorator"

import { UserService } from "../features/user/user.service"
import { AuthService } from "./auth.service"
import { OtpRequestDto } from "./dto/request/create-otp.dto"
import { LoginCredentialsDto } from "./dto/request/login-credentials.dto"
import { RefreshTokenRequestDto } from "./dto/request/refresh-token-request.dto"
import { SignUpRequestDto } from "./dto/request/signup-request.dto"
import { VerifyOtpRequestDto } from "./dto/request/verify-otp-request.dto"
import { SignUpResponse } from "./types/signup-response"

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @ApiOperation({
    summary: "Sign up user"
  })
  @ApiBody({
    type: SignUpRequestDto
  })
  @Public()
  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignUpRequestDto): Promise<SignUpResponse> {
    try {
      const signupResponse = await this.authService.signup(dto)
      return signupResponse
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to sign up",
        error.status || HttpStatus.BAD_REQUEST
      )
    }
  }

  /** Verify OTP */
  @ApiOperation({
    summary: "Verify OTP for account activation"
  })
  @ApiBody({
    type: VerifyOtpRequestDto
  })
  @Public()
  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpRequestDto): Promise<{ message: string }> {
    try {
      await this.authService.verifyOtp(dto.phoneNumber, dto.otp)
      return { message: "OTP verified successfully." }
    } catch (error) {
      console.error("Error during OTP verification:", error)
      throw new HttpException(
        error.message || "Failed to verify OTP",
        error.status || HttpStatus.BAD_REQUEST
      )
    }
  }

  /** Resend OTP */
  @ApiOperation({
    summary: "Resend OTP to phone number"
  })
  @ApiBody({
    type: OtpRequestDto
  })
  @Public()
  @Post("resend-otp")
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: OtpRequestDto): Promise<{ message: string }> {
    try {
      await this.authService.resendOtp(dto.phoneNumber)
      return { message: "OTP has been resent to your phone number." }
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to resend OTP",
        error.status || HttpStatus.BAD_REQUEST
      )
    }
  }

  /** User Login */
  @ApiOperation({
    summary: "Login user"
  })
  @ApiBody({
    type: LoginCredentialsDto
  })
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginCredentialsDto,
    @Req() request: RequestType,
    @Res({ passthrough: true }) res: ResponseType
  ): Promise<import("./dto/response/login-response.dto").LoginResponseDto> {
    try {
      const browserInfo =
        `${request.ip} ${request.headers["user-agent"]} ${request.headers["accept-language"]}`.replace(
          / undefined/g,
          ""
        )

      const credentials = await this.authService.login(dto, browserInfo)

      // Set Access Token cookie
      res.cookie("accessToken", credentials.accessToken, {
        expires: credentials.access_token_expires,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "development" ? false : true
      })

      // Set Refresh Token cookie
      res.cookie("refreshToken", credentials.refreshToken, {
        expires: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 7 days
        ),
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "development" ? false : true
      })

      return credentials
    } catch (error) {
      console.error("Error during login:", error)
      throw new HttpException(
        error.message || "Failed to log in",
        error.status || HttpStatus.BAD_REQUEST
      )
    }
  }

  /** Refresh Token */
  @ApiOperation({
    summary: "Refresh access token"
  })
  @ApiBody({
    type: RefreshTokenRequestDto
  })
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() dto: RefreshTokenRequestDto,
    @Req() request: RequestType,
    @Res({ passthrough: true }) res: ResponseType
  ): Promise<import("./dto/response/refresh-token-response.dto").RefreshTokenResponseDto> {
    try {
      const browserInfo =
        `${request.ip} ${request.headers["user-agent"]} ${request.headers["accept-language"]}`.replace(
          / undefined/g,
          ""
        )

      const credentials = await this.authService.refreshToken(dto.refreshToken, browserInfo)

      // Set new Access Token cookie
      res.cookie("accessToken", credentials.accessToken, {
        expires: credentials.access_token_expires,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "development" ? false : true
      })

      // Set new Refresh Token cookie
      res.cookie("refreshToken", credentials.refreshToken, {
        expires: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 7 days
        ),
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "development" ? false : true
      })

      return credentials
    } catch (error) {
      console.error("Error during token refresh:", error)
      throw new HttpException("Failed to refresh token", HttpStatus.UNAUTHORIZED)
    }
  }

  /** Logout user */
  @ApiOperation({
    summary: "Logout user"
  })
  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: RequestType,
    @Res({ passthrough: true }) res: ResponseType
  ): Promise<{ message: string }> {
    try {
      const cookies = request.cookies
      const refreshToken = cookies?.refreshToken

      if (refreshToken) {
        await this.authService.logout(refreshToken)
      }

      // Clear cookies
      res.cookie("accessToken", "", {
        expires: new Date(0),
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "development" ? false : true
      })

      res.cookie("refreshToken", "", {
        expires: new Date(0),
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "development" ? false : true
      })

      return { message: "Logged out successfully." }
    } catch (error) {
      console.error("Error during logout:", error)
      throw new HttpException("Failed to logout", HttpStatus.BAD_REQUEST)
    }
  }

  /** Forgot Password */
  @ApiOperation({
    summary: "Forgot password",
    description: "This API is for resetting the password via OTP"
  })
  @ApiBody({
    type: OtpRequestDto
  })
  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: OtpRequestDto): Promise<{ message: string }> {
    try {
      await this.authService.forgotPassword(dto.phoneNumber)
      return {
        message: "Password reset OTP has been sent to your phone number."
      }
    } catch (error) {
      console.error("Error during forgot password:", error)
      throw new HttpException(
        error.message || "Failed to initiate password reset",
        error.status || HttpStatus.BAD_REQUEST
      )
    }
  }
}
