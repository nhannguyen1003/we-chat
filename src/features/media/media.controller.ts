// src/features/media/media.controller.ts
import { Controller, Post, Get, Patch, Param, Body, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger"

import { GetCurrentUserId } from "@agileoffice/core/decorator/get-current-user-id.decorator"

import { CreateMediaDto } from "./dto/create-media.dto"
import { FindMediaDto } from "./dto/find-media.dto"
import { UpdateMediaDto } from "./dto/update-media.dto"
import { MediaEntity } from "./entities/media.entity"
import { MediaService } from "./media.service"

@ApiTags("Media")
@ApiBearerAuth()
@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({ summary: "Upload media" })
  @ApiBody({ type: CreateMediaDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async uploadMedia(
    @Body() createMediaDto: CreateMediaDto,
    @GetCurrentUserId() userId: number
  ): Promise<MediaEntity> {
    return this.mediaService.uploadMedia(userId, createMediaDto)
  }

  @ApiOperation({ summary: "Find media" })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findMedia(@Body() findMediaDto: FindMediaDto): Promise<MediaEntity[]> {
    return this.mediaService.findMedia(findMediaDto)
  }

  @ApiOperation({ summary: "Update media" })
  @ApiBody({ type: UpdateMediaDto })
  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  async updateMedia(
    @Param("id") id: number,
    @Body() updateMediaDto: UpdateMediaDto,
    @GetCurrentUserId() userId: number
  ): Promise<MediaEntity> {
    return this.mediaService.updateMedia(id, userId, updateMediaDto)
  }
}
