-- CreateEnum
CREATE TYPE "ChatbotRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ChatbotStatus" AS ENUM ('ACTIVE', 'ESCALATED', 'CLOSED');

-- CreateTable
CREATE TABLE "ChatbotConversation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "status" "ChatbotStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "ChatbotRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotConversation_sessionId_key" ON "ChatbotConversation"("sessionId");

-- CreateIndex
CREATE INDEX "ChatbotConversation_userId_idx" ON "ChatbotConversation"("userId");

-- CreateIndex
CREATE INDEX "ChatbotConversation_status_idx" ON "ChatbotConversation"("status");

-- CreateIndex
CREATE INDEX "ChatbotConversation_createdAt_idx" ON "ChatbotConversation"("createdAt");

-- CreateIndex
CREATE INDEX "ChatbotMessage_conversationId_idx" ON "ChatbotMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ChatbotMessage_createdAt_idx" ON "ChatbotMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "ChatbotConversation" ADD CONSTRAINT "ChatbotConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotMessage" ADD CONSTRAINT "ChatbotMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatbotConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
