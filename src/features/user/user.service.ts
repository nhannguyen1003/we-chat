// src/features/user/user.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common"

import { UserNotFoundException } from "@agileoffice/core/exception/user/user-not-found.exception"
import { MediaType, Prisma, PrismaService } from "@agileoffice/prisma"

import { UpdateUserDto, FindUsersDto } from "./dto"
import { User } from "./entities"

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /** Finds a user by phone number */
  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        gender: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        hash: true
      }
    })

    if (!user) {
      throw new UserNotFoundException()
    }

    return user
  }

  /** Finds a user by ID */
  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        gender: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        hash: true
      }
    })

    if (!user) {
      throw new UserNotFoundException()
    }

    return user
  }

  /** Updates user information */
  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const avatar = await this.prisma.media.create({
      data: {
        url: dto.avatarUrl,
        type: MediaType.IMAGE
      }
    })
    const updatedUser = await this.prisma.user.update({
      where: { id },
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
        avatar: true
      }
    })

    return updatedUser
  }

  /**
   * Find friends based on a search query.
   * The search can match either the phone number exactly or
   * the firstName/lastName partially (case-insensitive).
   *
   * @param userId - ID of the current user
   * @param findUsersDto - DTO containing the search query
   * @returns List of matching friends
   */
  async findUsers(userId: number, findUsersDto: FindUsersDto): Promise<User[]> {
    const { search } = findUsersDto

    if (!search || search.trim() === "") {
      throw new ForbiddenException("Search query cannot be empty")
    }

    // Build the WHERE clause
    const whereClause: Prisma.UserWhereInput = {
      NOT: { id: userId }, // Exclude the current user
      OR: [
        { phoneNumber: search }, // Exact match on phone number
        {
          AND: [
            {
              OR: [
                {
                  firstName: {
                    contains: search,
                    mode: "insensitive" // Case-insensitive search
                  }
                },
                {
                  lastName: {
                    contains: search,
                    mode: "insensitive" // Case-insensitive search
                  }
                }
              ]
            },
            {
              OR: [
                {
                  sentFriendRequests: {
                    some: {
                      toUserId: userId,
                      status: "ACCEPTED"
                    }
                  }
                },
                {
                  receivedFriendRequests: {
                    some: {
                      fromUserId: userId,
                      status: "ACCEPTED"
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      include: {
        avatar: true,
        chats: {
          include: {
            chat: true
          }
        },
        messages: true,
        sentFriendRequests: true,
        receivedFriendRequests: true,
        userTokens: true
      }
    })

    return users as unknown as User[]
  }

  /**
   * Retrieve the list of friends for a user.
   *
   * @param userId - ID of the current user
   * @returns List of UserEntity representing friends
   */
  async getFriends(userId: number): Promise<User[]> {
    const friends = await this.prisma.friendRequest.findMany({
      where: {
        OR: [
          { fromUserId: userId, status: "ACCEPTED" },
          { toUserId: userId, status: "ACCEPTED" }
        ]
      },
      include: {
        fromUser: true,
        toUser: true
      }
    })

    const friendUserIds = friends.map((fr) => (fr.fromUserId === userId ? fr.toUser : fr.fromUser))

    return friendUserIds as unknown as User[]
  }

  async getFriendsStatuses(userId: number) {
    const friends = await this.prisma.user.findMany({
      where: {
        OR: [
          { sentFriendRequests: { some: { toUserId: userId, status: "ACCEPTED" } } },
          { receivedFriendRequests: { some: { fromUserId: userId, status: "ACCEPTED" } } }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true // Trạng thái ONLINE/OFFLINE
      }
    })

    return friends
  }
}
