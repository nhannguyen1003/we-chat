-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('IN_CHAT', 'WAITING');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "status" "ChatStatus" NOT NULL DEFAULT 'WAITING';
