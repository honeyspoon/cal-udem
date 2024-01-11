/*
  Warnings:

  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `semester` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseSemester` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_courseShort_name_fkey";

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
ADD COLUMN     "semester" TEXT NOT NULL,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("short_name", "semester");

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "courseSemester" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "class_data" JSONB NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_courseShort_name_courseSemester_fkey" FOREIGN KEY ("courseShort_name", "courseSemester") REFERENCES "Course"("short_name", "semester") ON DELETE CASCADE ON UPDATE CASCADE;
