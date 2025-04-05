const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { createHotelBooking, getUserHotelBookings, getHotelOwnerBookings } = require("../controllers/hotelBookController");
const { initiateHotelPayment, verifyHotelPayment } = require("../controllers/hotelPaymentController");

const router = express.Router();

// Hotel booking routes
router.post("/hotel/create", authenticateUser(), createHotelBooking);
router.get("/hotel/user", authenticateUser(), getUserHotelBookings);
router.get("/hotel/owner", authenticateUser(), getHotelOwnerBookings);

// Hotel payment routes
router.post("/hotel/initiate-payment", authenticateUser(), initiateHotelPayment);
router.post("/hotel/verify-payment", authenticateUser(), verifyHotelPayment);

module.exports = router;
