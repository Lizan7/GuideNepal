// ratingRoutes.js
const express = require("express");
const router = express.Router();
const { createRating, getRatings } = require("../controllers/ratingController");
const { authenticateUser } = require("../middlewares/authMiddleware");

// Define route for creating a rating at '/createRating'
router.post("/createRating", authenticateUser(), createRating);

// Define route for retrieving ratings, e.g., GET /api/rate/guide/123
router.get("/:type/:id", getRatings);

module.exports = router;
