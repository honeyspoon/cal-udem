-- CreateTable
CREATE TABLE "course" (
    "short_name" TEXT NOT NULL,
    "long_name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "groups" TEXT[],

    CONSTRAINT "course_pkey" PRIMARY KEY ("short_name")
);
