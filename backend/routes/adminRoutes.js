const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  verifyGuide,
  verifyHotel,
} = require("../controllers/adminController");

// All admin routes should be protected with ADMIN role
router.use(authenticateUser(["ADMIN"]));

// Verify a guide
router.post("/verify-guide/:guideId", verifyGuide);

// Verify a hotel
router.post("/verify-hotel/:hotelId", verifyHotel);

module.exports = router; 