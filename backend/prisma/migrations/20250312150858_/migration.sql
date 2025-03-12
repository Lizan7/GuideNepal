/*
  Warnings:

  - You are about to drop the column `Rooms` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `hotelLocation` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `hotelphoneNumber` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `hotel` table. All the data in the column will be lost.
  - You are about to drop the column `verificationImage` on the `hotel` table. All the data in the column will be lost.
  - Added the required column `email` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itineraries` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomsAvailable` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Hotel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `hotel` DROP COLUMN `Rooms`,
    DROP COLUMN `hotelLocation`,
    DROP COLUMN `hotelphoneNumber`,
    DROP COLUMN `profileImage`,
    DROP COLUMN `verificationImage`,
    ADD COLUMN `certificate` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `itineraries` VARCHAR(191) NOT NULL,
    ADD COLUMN `location` VARCHAR(191) NOT NULL,
    ADD COLUMN `mainImage` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `roomsAvailable` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
