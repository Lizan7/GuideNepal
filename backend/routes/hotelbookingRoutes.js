const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { createHotelBooking, getUserHotelBookings, getHotelOwnerBookings } = require("../controllers/hotelBookController");

const router = express.Router();

router.post("/hotel/create", authenticateUser(), createHotelBooking);
router.get("/hotel/user", authenticateUser(), getUserHotelBookings);
router.get("/hotel/owner", authenticateUser(), getHotelOwnerBookings);

module.exports = router;
