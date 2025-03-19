const express = require("express");
const router = express.Router();
const { storeGuideDetails, getGuideDetails, getGuideProfileDetails } = require("../controllers/guideController");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/verifyGuide", authenticateUser(), storeGuideDetails);
router.get("/details", authenticateUser(), getGuideDetails);
router.get("/profile", authenticateUser(), getGuideProfileDetails);

module.exports = router;
