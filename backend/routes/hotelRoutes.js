const express = require("express");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { verifyHotelDetails, getHotels, getHotelById } = require("../controllers/hotelController");

const router = express.Router();

router.post("/verify", authenticateUser(["HOTEL"]), verifyHotelDetails); // ✅ Only HOTEL role can verify
router.get("/hotelDetails", authenticateUser(), getHotels); // ✅ Any logged-in user can view hotels
router.get("/:id", authenticateUser(), getHotelById); // ✅ Any logged-in user can view hotel details

module.exports = router;
