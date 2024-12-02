// prisma/seed.js
import { MediaType, PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("📦 Seeding database...")

  // **1. Create Media (Avatars)**
  const media1 = await prisma.media.create({
    data: {
      type: MediaType.IMAGE,
      url: "https://example.com/avatars/avatar1.png"
    }
  })

  const media2 = await prisma.media.create({
    data: {
      type: MediaType.IMAGE,
      url: "https://example.com/avatars/avatar2.png"
    }
  })

  const media3 = await prisma.media.create({
    data: {
      type: MediaType.IMAGE,
      url: "https://example.com/avatars/avatar3.png"
    }
  })

  // **2. Create Users**
  const user1 = await prisma.user.create({
    data: {
      firstName: "Alice",
      lastName: "Smith",
      phoneNumber: "+1234567890",
      hash: await bcrypt.hash("12345678", 10), // Replace with hashed passwords
      gender: "Female",
      avatar: {
        connect: { id: media1.id }
      },
      isVerified: true
    }
  })

  const user2 = await prisma.user.create({
    data: {
      firstName: "Bob",
      lastName: "Johnson",
      phoneNumber: "+1987654321",
      hash: await bcrypt.hash("12345678", 10), // Replace with hashed passwords
      gender: "Male",
      avatar: {
        connect: { id: media2.id }
      },
      isVerified: true
    }
  })

  const user3 = await prisma.user.create({
    data: {
      firstName: "Charlie",
      lastName: "Brown",
      phoneNumber: "+1122334455",
      hash: await bcrypt.hash("12345678", 10), // Replace with hashed passwords
      gender: "Non-binary",
      avatar: {
        connect: { id: media3.id }
      },
      isVerified: true
    }
  })

  console.log("✅ Users created")

  // **3. Create Friend Requests**
  await prisma.friendRequest.create({
    data: {
      fromUser: { connect: { id: user1.id } },
      toUser: { connect: { id: user2.id } },
      status: "ACCEPTED"
    }
  })

  await prisma.friendRequest.create({
    data: {
      fromUser: { connect: { id: user2.id } },
      toUser: { connect: { id: user3.id } },
      status: "PENDING"
    }
  })

  console.log("✅ Friend Requests created")

  // **4. Create Chats**
  // **4.1 One-on-One Chat between Alice and Bob**
  const chat1 = await prisma.chat.create({
    data: {
      type: "DUAL",
      users: {
        create: [{ user: { connect: { id: user1.id } } }, { user: { connect: { id: user2.id } } }]
      }
    }
  })

  // **4.2 Group Chat with Alice, Bob, and Charlie**
  const chat2 = await prisma.chat.create({
    data: {
      type: "GROUP",
      name: "Project Team",
      users: {
        create: [
          { user: { connect: { id: user1.id } }, role: "admin" },
          { user: { connect: { id: user2.id } }, role: "member" },
          { user: { connect: { id: user3.id } }, role: "member" }
        ]
      }
    }
  })

  console.log("✅ Chats created")

  // **5. Create Messages**
  // **5.1 Messages in One-on-One Chat**
  await prisma.message.create({
    data: {
      type: "text",
      content: "Hi Bob! How are you?",
      chat: { connect: { id: chat1.id } },
      fromUser: { connect: { id: user1.id } },
      status: "READ"
    }
  })

  await prisma.message.create({
    data: {
      type: "text",
      content: "Hello Alice! I am good, thanks!",
      chat: { connect: { id: chat1.id } },
      fromUser: { connect: { id: user2.id } },
      status: "READ"
    }
  })

  // **5.2 Messages in Group Chat**
  await prisma.message.create({
    data: {
      type: "text",
      content: "Welcome to the Project Team chat!",
      chat: { connect: { id: chat2.id } },
      fromUser: { connect: { id: user1.id } },
      status: "READ"
    }
  })

  await prisma.message.create({
    data: {
      type: "image",
      content: "Check out this diagram.",
      chat: { connect: { id: chat2.id } },
      fromUser: { connect: { id: user3.id } },
      media: {
        create: {
          type: MediaType.IMAGE,
          url: "https://example.com/media/diagram.png"
        }
      },
      status: "READ"
    }
  })

  console.log("✅ Messages created")

  // **6. Create Additional Media (Optional)**
  // You can add more media files as needed for testing.

  console.log("🎉 Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
