const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  createPackage,
  getAllPackages,
  getGuidePackages,
  updatePackage,
  deletePackage,
  getEnrolledPackages,
  enrollInPackage,
} = require("../controllers/packageController");

// Public routes
router.get("/", getAllPackages);

// Protected routes
router.post("/create", authenticateUser(), createPackage);
router.get("/guide", authenticateUser(), getGuidePackages);
router.put("/:id", authenticateUser(), updatePackage);
router.delete("/:id", authenticateUser(), deletePackage);

// Package enrollment routes
router.get("/enrolled", authenticateUser(), getEnrolledPackages);
router.post("/:packageId/enroll", authenticateUser(), enrollInPackage);

module.exports = router; 