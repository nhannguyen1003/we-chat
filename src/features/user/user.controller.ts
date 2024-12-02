// src/features/user/user.controller.ts
import {
  Controller,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Query,
  Put
} from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger"

import { GetCurrentUserId } from "@agileoffice/core/decorator/get-current-user-id.decorator"

import { GetCurrentUserResponse } from "../../auth/types/get-current-user-response.type"
import { FindUsersDto } from "./dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { UserService } from "./user.service"

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** Get Current User Information */
  @ApiOperation({ summary: "Get current user information" })
  @ApiBearerAuth()
  @Get("/me")
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@GetCurrentUserId() userId: number): Promise<GetCurrentUserResponse> {
    try {
      const user = await this.userService.findById(userId)
      return user
    } catch (error) {
      throw new HttpException("Failed to fetch user", HttpStatus.BAD_REQUEST)
    }
  }

  /** Update Current User Information */
  @ApiOperation({ summary: "Update current user information" })
  @ApiBody({ type: UpdateUserDto })
  @ApiBearerAuth()
  @Put("/me")
  @HttpCode(HttpStatus.OK)
  async updateCurrentUser(
    @GetCurrentUserId() userId: number,
    @Body() dto: UpdateUserDto
  ): Promise<GetCurrentUserResponse> {
    try {
      const updatedUser = await this.userService.updateUser(userId, dto)
      return updatedUser
    } catch (error) {
      throw new HttpException("Failed to update user", HttpStatus.BAD_REQUEST)
    }
  }

  @ApiOperation({ summary: "Find user by phone number" })
  @ApiBearerAuth()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findUserById(@Query() dto: FindUsersDto): Promise<GetCurrentUserResponse> {
    try {
      const user = await this.userService.findByPhoneNumber(dto.search)
      return user
    } catch (error) {
      throw new HttpException("Failed to find user", HttpStatus.BAD_REQUEST)
    }
  }

  @ApiOperation({ summary: "Get statuses of user's friends" })
  @Get("friends/status")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async getFriendStatuses(@GetCurrentUserId() userId: number) {
    const statuses = await this.userService.getFriendsStatuses(userId)
    return {
      statusCode: HttpStatus.OK,
      data: statuses
    }
  }
}
