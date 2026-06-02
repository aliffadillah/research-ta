/*
  Warnings:

  - You are about to drop the column `nameId` on the `foods` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `menu_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `carbs` on the `menu_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `menu_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `menu_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `fiber` on the `menu_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `nameId` on the `menu_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `menu_recommendations` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `menu_recommendations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `foods` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `menu_recommendations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `caloriesBesar` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `caloriesKecil` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carbsBesar` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carbsKecil` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatBesar` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatKecil` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fiberBesar` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fiberKecil` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinBesar` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinKecil` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggal` to the `menu_recommendations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "foods" DROP COLUMN "nameId";

-- AlterTable
ALTER TABLE "menu_recommendations" DROP COLUMN "calories",
DROP COLUMN "carbs",
DROP COLUMN "category",
DROP COLUMN "fat",
DROP COLUMN "fiber",
DROP COLUMN "nameId",
DROP COLUMN "protein",
DROP COLUMN "tags",
ADD COLUMN     "caloriesBesar" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "caloriesKecil" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "carbsBesar" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "carbsKecil" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fatBesar" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fatKecil" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fiberBesar" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fiberKecil" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "proteinBesar" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "proteinKecil" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tanggal" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "daily_nutritions" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "carbsBesar" DOUBLE PRECISION NOT NULL,
    "proteinBesar" DOUBLE PRECISION NOT NULL,
    "fatBesar" DOUBLE PRECISION NOT NULL,
    "fiberBesar" DOUBLE PRECISION NOT NULL,
    "energyBesar" DOUBLE PRECISION NOT NULL,
    "carbsKecil" DOUBLE PRECISION NOT NULL,
    "proteinKecil" DOUBLE PRECISION NOT NULL,
    "fatKecil" DOUBLE PRECISION NOT NULL,
    "fiberKecil" DOUBLE PRECISION NOT NULL,
    "energyKecil" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_nutritions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_nutritions_date_key" ON "daily_nutritions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "foods_name_key" ON "foods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "menu_recommendations_name_key" ON "menu_recommendations"("name");
