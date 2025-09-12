-- CreateEnum
CREATE TYPE "public"."ModelType" AS ENUM ('CLASSIFICATION', 'ANOMALY_DETECTION');

-- CreateTable
CREATE TABLE "public"."Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ModelType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" BYTEA NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);
