const express = require("express");
const router = express.Router();
const { storeGuideDetails, getGuideDetails, getGuideProfileDetails, getGuideLocations, getAllGuideDetails } = require("../controllers/guideController");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/verifyGuide", authenticateUser(), storeGuideDetails);
router.get("/details", authenticateUser(), getGuideDetails);
router.get("/profile", authenticateUser(), getGuideProfileDetails);
router.get("/locations", authenticateUser(), getGuideLocations);
router.get("/all", authenticateUser(), getAllGuideDetails);

module.exports = router;
