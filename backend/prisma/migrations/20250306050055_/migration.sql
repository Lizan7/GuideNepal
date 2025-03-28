/*
  Warnings:

  - Added the required column `isVerified` to the `Guide` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `guide` ADD COLUMN `isVerified` BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE `Hotel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `hotelphoneNumber` VARCHAR(191) NOT NULL,
    `hotelLocation` VARCHAR(191) NOT NULL,
    `Rooms` INTEGER NOT NULL,
    `profileImage` LONGTEXT NULL,
    `verificationImage` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Hotel_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Hotel` ADD CONSTRAINT `Hotel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
