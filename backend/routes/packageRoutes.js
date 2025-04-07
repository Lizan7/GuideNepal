const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  createPackage,
  getAllPackages,
  getGuidePackages,
  updatePackage,
  deletePackage,
} = require("../controllers/packageController");

// Create a new package (requires authentication)
router.post("/create", authenticateUser(), createPackage);

// Get all packages
router.get("/all", getAllPackages);

// Get packages for the authenticated guide
router.get("/guide", authenticateUser(), getGuidePackages);

// Update a package
router.put("/:id", authenticateUser(), updatePackage);

// Delete a package
router.delete("/:id", authenticateUser(), deletePackage);

module.exports = router; 