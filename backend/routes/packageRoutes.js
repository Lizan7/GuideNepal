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
  getEnrolledUsers,
} = require("../controllers/packageController");

// Public routes
router.get("/", getAllPackages);

// Package enrollment routes - place these before the :id routes to avoid conflicts
router.get("/enrolled", authenticateUser(), getEnrolledPackages);
router.get("/:packageId/enrolled-users", authenticateUser(), getEnrolledUsers);
router.post("/:packageId/enroll", authenticateUser(), enrollInPackage);

// Protected routes
router.post("/create", authenticateUser(), createPackage);
router.get("/guide", authenticateUser(), getGuidePackages);
router.put("/:id", authenticateUser(), updatePackage);
router.delete("/:id", authenticateUser(), deletePackage);

module.exports = router; 