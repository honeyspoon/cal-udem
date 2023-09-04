-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_courseShort_name_fkey";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_courseShort_name_fkey" FOREIGN KEY ("courseShort_name") REFERENCES "Course"("short_name") ON DELETE CASCADE ON UPDATE CASCADE;
