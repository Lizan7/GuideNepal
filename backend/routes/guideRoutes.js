const express = require("express");
const router = express.Router();
const { storeGuideDetails, getGuideDetails } = require("../controllers/guideController");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/verifyGuide", authenticateUser(), storeGuideDetails);
router.get("/details", authenticateUser(), getGuideDetails);

module.exports = router;
