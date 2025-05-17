const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { verifyHotelDetails, getHotels, getHotelById, getHotelLocations, getAllHotelDetails, getHotelProfileDetails } = require("../controllers/hotelController");

const router = express.Router();

// Hotel verification route
router.post("/verify", authenticateUser(["HOTEL"]), verifyHotelDetails);

// Get all hotels
router.get("/", authenticateUser(), getHotels);

// Get all hotel details
router.get("/all", authenticateUser(), getAllHotelDetails);

// Get hotel locations
router.get("/locations", authenticateUser(), getHotelLocations);

// Get hotel profile details
router.get("/profile", authenticateUser(["HOTEL"]), getHotelProfileDetails);

// Get hotel by ID
router.get("/:id", authenticateUser(), getHotelById);

module.exports = router;
