/*
  Warnings:

  - Added the required column `charge` to the `Guide` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `guide` ADD COLUMN `charge` DOUBLE NOT NULL;
