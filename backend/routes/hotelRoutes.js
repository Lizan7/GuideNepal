const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { verifyHotelDetails, getHotels, getHotelById, getHotelLocations, getAllHotelDetails } = require("../controllers/hotelController");

const router = express.Router();

// Hotel verification route
router.post("/verify", authenticateUser(["HOTEL"]), verifyHotelDetails);

// Get all hotels
router.get("/", authenticateUser(), getHotels);

// Get all hotel details
router.get("/all", authenticateUser(), getAllHotelDetails);

// Get hotel by ID
router.get("/:id", authenticateUser(), getHotelById);

// Get hotel locations
router.get("/locations", authenticateUser(), getHotelLocations);

module.exports = router;
