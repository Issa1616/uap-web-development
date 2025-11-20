-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BooksRead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT,
    "pages" INTEGER,
    "publisher" TEXT,
    "publishedAt" TEXT,
    "categories" TEXT,
    "isbn" TEXT,
    "thumbnail" TEXT,
    "rating" INTEGER,
    "review" TEXT,
    "finishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BooksRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BooksRead" ("authors", "bookId", "finishedAt", "id", "rating", "review", "title", "userId") SELECT "authors", "bookId", "finishedAt", "id", "rating", "review", "title", "userId" FROM "BooksRead";
DROP TABLE "BooksRead";
ALTER TABLE "new_BooksRead" RENAME TO "BooksRead";
CREATE INDEX "BooksRead_userId_idx" ON "BooksRead"("userId");
CREATE INDEX "BooksRead_bookId_idx" ON "BooksRead"("bookId");
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
INSERT INTO "new_ReadingList" ("addedAt", "authors", "bookId", "id", "notes", "priority", "title", "userId") SELECT "addedAt", "authors", "bookId", "id", "notes", "priority", "title", "userId" FROM "ReadingList";
DROP TABLE "ReadingList";
ALTER TABLE "new_ReadingList" RENAME TO "ReadingList";
CREATE INDEX "ReadingList_userId_idx" ON "ReadingList"("userId");
CREATE INDEX "ReadingList_bookId_idx" ON "ReadingList"("bookId");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("email", "id", "name") SELECT "email", "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
