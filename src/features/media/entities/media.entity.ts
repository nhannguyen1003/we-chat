import { MediaType } from "@prisma/client"

// src/features/media/entities/media.entity.ts
export class MediaEntity {
  id: number
  type: MediaType
  url: string
  userId?: number
  messageId?: number
  createdAt: Date
  updatedAt: Date
}
