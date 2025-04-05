const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
  createPackage,
  getAllPackages,
  getGuidePackages,
  updatePackage,
  deletePackage,
} = require("../controllers/packageController");

// Create a new package (requires authentication)
router.post("/create", authenticateToken, createPackage);

// Get all packages
router.get("/all", getAllPackages);

// Get packages for the authenticated guide
router.get("/guide", authenticateToken, getGuidePackages);

// Update a package
router.put("/:id", authenticateToken, updatePackage);

// Delete a package
router.delete("/:id", authenticateToken, deletePackage);

module.exports = router; 