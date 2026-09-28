/*
  Warnings:

  - Made the column `eventId` on table `Chat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "eventId" SET NOT NULL;
