// src/features/friend-request/friend-request.controller.ts
import { Controller, Post, Get, Patch, Param, Body, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger"

import { GetCurrentUserId } from "@agileoffice/core/decorator/get-current-user-id.decorator"

import { CreateFriendRequestDto } from "./dto/create-friend-request.dto"
import { FindFriendRequestDto } from "./dto/find-friend-request.dto"
import { UpdateFriendRequestDto } from "./dto/update-friend-request.dto"
import { FriendRequestEntity } from "./entities/friend-request.entity"
import { FriendRequestService } from "./friend-request.service"

@ApiTags("FriendRequest")
@ApiBearerAuth()
@Controller("friend-request")
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @ApiOperation({ summary: "Send a friend request" })
  @ApiBody({ type: CreateFriendRequestDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendFriendRequest(
    @Body() createFriendRequestDto: CreateFriendRequestDto,
    @GetCurrentUserId() userId: number
  ): Promise<FriendRequestEntity> {
    return this.friendRequestService.sendFriendRequest(userId, createFriendRequestDto)
  }

  @ApiOperation({ summary: "Find friend requests" })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findFriendRequests(
    @GetCurrentUserId() userId: number,
    @Body() findFriendRequestDto: FindFriendRequestDto
  ): Promise<FriendRequestEntity[]> {
    return this.friendRequestService.findFriendRequests(userId, findFriendRequestDto)
  }

  @ApiOperation({ summary: "Update a friend request" })
  @ApiBody({ type: UpdateFriendRequestDto })
  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  async updateFriendRequest(
    @Param("id") id: number,
    @Body() updateFriendRequestDto: UpdateFriendRequestDto,
    @GetCurrentUserId() userId: number
  ): Promise<FriendRequestEntity> {
    return this.friendRequestService.updateFriendRequest(id, userId, updateFriendRequestDto)
  }
}
