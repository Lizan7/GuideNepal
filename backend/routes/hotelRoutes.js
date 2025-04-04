const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { verifyHotelDetails, getHotels, getHotelById, getHotelLocations } = require("../controllers/hotelController");

const router = express.Router();

// Hotel verification route
router.post("/verify", authenticateUser(["HOTEL"]), verifyHotelDetails);

// Get all hotels
router.get("/", authenticateUser(), getHotels);

// Get all hotel locations
router.get("/locations", authenticateUser(), getHotelLocations);

// Get hotel by ID - this must come after other specific routes
router.get("/:id", authenticateUser(), getHotelById);

module.exports = router;
