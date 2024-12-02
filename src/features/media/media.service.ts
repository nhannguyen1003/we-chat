// src/features/media/media.service.ts
import { MediaType } from "@prisma/client"

import { Injectable, ForbiddenException } from "@nestjs/common"

import { PrismaService } from "../../prisma/prisma.service"
import { CreateMediaDto } from "./dto/create-media.dto"
import { FindMediaDto } from "./dto/find-media.dto"
import { UpdateMediaDto } from "./dto/update-media.dto"
import { MediaEntity } from "./entities/media.entity"
import { MediaNotFoundException } from "./exceptions/media.exception"

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadMedia(userId: number, createMediaDto: CreateMediaDto): Promise<MediaEntity> {
    const { type, url, messageId } = createMediaDto

    // Ensure `type` is a valid `MediaType`
    if (!Object.values(MediaType).includes(type)) {
      throw new ForbiddenException(`Invalid media type: ${type}`)
    }

    const media = await this.prisma.media.create({
      data: {
        type, // Now guaranteed to be a valid MediaType
        url,
        messageId,
        user: { connect: { id: userId } }
      }
    })

    return media as unknown as MediaEntity
  }

  async findMedia(findMediaDto: FindMediaDto): Promise<MediaEntity[]> {
    const { id, type } = findMediaDto

    const media = await this.prisma.media.findMany({
      where: {
        ...(id && { id }),
        ...(type && { type: type as MediaType })
      }
    })

    return media as unknown as MediaEntity[]
  }

  async updateMedia(
    id: number,
    userId: number,
    updateMediaDto: UpdateMediaDto
  ): Promise<MediaEntity> {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true }
        }
      }
    })

    if (!media) {
      throw new MediaNotFoundException(id)
    }

    if (media.user.id !== userId) {
      throw new ForbiddenException("You are not authorized to update this media")
    }

    // Validate `type` if provided
    if (updateMediaDto.type && !Object.values(MediaType).includes(updateMediaDto.type)) {
      throw new ForbiddenException(`Invalid media type: ${updateMediaDto.type}`)
    }

    const updatedMedia = await this.prisma.media.update({
      where: { id },
      data: {
        type: updateMediaDto.type as MediaType, // Cast `type` to MediaType
        url: updateMediaDto.url
      }
    })

    return updatedMedia as unknown as MediaEntity
  }
}
