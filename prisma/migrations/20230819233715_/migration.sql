/*
  Warnings:

  - You are about to drop the `course` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "course";

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "repeatCount" INTEGER NOT NULL,
    "group" TEXT NOT NULL,
    "courseShort_name" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "short_name" TEXT NOT NULL,
    "long_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "groups" TEXT[],

    CONSTRAINT "Course_pkey" PRIMARY KEY ("short_name")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_courseShort_name_fkey" FOREIGN KEY ("courseShort_name") REFERENCES "Course"("short_name") ON DELETE RESTRICT ON UPDATE CASCADE;
