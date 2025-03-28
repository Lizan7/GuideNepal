const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { createUserBooking, getUserBookings, getGuideBookings } = require("../controllers/bookingController");
const prisma = new PrismaClient();

// Create a new booking
router.post("/create", authenticateUser(), createUserBooking);

// Get all bookings for the logged-in user
router.get("/user/:userId", authenticateUser(), getUserBookings);

// Get all bookings for a guide
router.get("/guide", authenticateUser(), getGuideBookings);

module.exports = router;