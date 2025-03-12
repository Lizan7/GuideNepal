/*
  Warnings:

  - Added the required column `isVerified` to the `Hotel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `hotel` ADD COLUMN `isVerified` BOOLEAN NOT NULL;
