/*
  Warnings:

  - A unique constraint covering the columns `[userId,bookId]` on the table `ReadingList` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ReadingList" ADD COLUMN "finishedAt" DATETIME;
ALTER TABLE "ReadingList" ADD COLUMN "pageCount" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ReadingList_userId_bookId_key" ON "ReadingList"("userId", "bookId");
