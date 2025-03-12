/*
  Warnings:

  - You are about to drop the column `bookingDate` on the `userbooking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `userbooking` DROP COLUMN `bookingDate`,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL;
