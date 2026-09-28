/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "eventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_eventId_key" ON "Chat"("eventId");
