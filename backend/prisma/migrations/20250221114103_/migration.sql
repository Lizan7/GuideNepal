-- CreateTable
CREATE TABLE `Guide` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `profileImage` VARCHAR(191) NULL,
    `verificationImage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Guide_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
