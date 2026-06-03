-- AlterTable
ALTER TABLE "daily_nutritions" ADD COLUMN     "isPredicted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "syncedAt" TIMESTAMP(3);
