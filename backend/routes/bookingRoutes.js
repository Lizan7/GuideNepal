const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { 
  createUserBooking, 
  getUserBookings, 
  getGuideBookings,
  checkGuideAvailability,
  getHotelBookings
} = require("../controllers/bookingController");
const { createHotelBooking } = require("../controllers/hotelBookController");
const prisma = new PrismaClient();

// Create a new booking
router.post("/create", authenticateUser(), createUserBooking);

// Create a new hotel booking
router.post("/hotel/create", authenticateUser(), createHotelBooking);

// Get all bookings for the logged-in user
router.get("/user/:userId", authenticateUser(), getUserBookings);

// Get all bookings for a guide
router.get("/guide", authenticateUser(), getGuideBookings);

// Get all bookings for a hotel
router.get("/hotel", authenticateUser(["HOTEL"]), getHotelBookings);

// Check guide availability for specific dates
router.post("/check-availability", authenticateUser(), checkGuideAvailability);

module.exports = router;