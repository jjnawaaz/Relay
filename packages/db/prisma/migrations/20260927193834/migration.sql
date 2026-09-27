/*
  Warnings:

  - A unique constraint covering the columns `[room_name]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Room_room_name_key" ON "Room"("room_name");
