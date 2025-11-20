/*
  Warnings:

  - You are about to drop the column `finishedAt` on the `ReadingList` table. All the data in the column will be lost.
  - You are about to drop the column `pageCount` on the `ReadingList` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReadingList" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT,
    "thumbnail" TEXT,
    "priority" TEXT,
    "notes" TEXT,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ReadingList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReadingList" ("addedAt", "authors", "bookId", "id", "notes", "priority", "read", "thumbnail", "title", "userId") SELECT "addedAt", "authors", "bookId", "id", "notes", "priority", "read", "thumbnail", "title", "userId" FROM "ReadingList";
DROP TABLE "ReadingList";
ALTER TABLE "new_ReadingList" RENAME TO "ReadingList";
CREATE INDEX "ReadingList_userId_idx" ON "ReadingList"("userId");
CREATE INDEX "ReadingList_bookId_idx" ON "ReadingList"("bookId");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name") SELECT "createdAt", "email", "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
