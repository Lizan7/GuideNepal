const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  verifyGuide,
  verifyHotel,
} = require("../controllers/adminController");

// Verify a guide
router.post("/verify-guide/:guideId", verifyGuide);

// Verify a hotel
router.post("/verify-hotel/:hotelId", verifyHotel);

module.exports = router; 