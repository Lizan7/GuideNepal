/*
  Warnings:

  - You are about to drop the column `roomsBooked` on the `hotelbooking` table. All the data in the column will be lost.
  - Added the required column `rooms` to the `HotelBooking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `hotelbooking` DROP COLUMN `roomsBooked`,
    ADD COLUMN `rooms` INTEGER NOT NULL;
