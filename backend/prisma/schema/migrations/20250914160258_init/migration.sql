-- CreateTable
CREATE TABLE "public"."Data" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" BYTEA NOT NULL,

    CONSTRAINT "Data_pkey" PRIMARY KEY ("id")
);
