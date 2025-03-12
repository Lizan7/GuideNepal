/*
  Warnings:

  - You are about to drop the column `mainImage` on the `hotel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `hotel` DROP COLUMN `mainImage`,
    ADD COLUMN `profileImage` VARCHAR(191) NULL;
