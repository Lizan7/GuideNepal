const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  getUsers,
  getGuides,
  getHotels,
  verifyGuide,
  verifyHotel,
} = require("../controllers/adminController");

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Apply authentication and admin check to all routes
router.use(authenticateUser, isAdmin);

// Get all users
router.get("/users", getUsers);

// Get all guides
router.get("/guides", getGuides);

// Get all hotels
router.get("/hotels", getHotels);

// Verify a guide
router.post("/verify-guide/:guideId", verifyGuide);

// Verify a hotel
router.post("/verify-hotel/:hotelId", verifyHotel);

module.exports = router; 