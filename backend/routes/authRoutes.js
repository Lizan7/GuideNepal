const express = require("express");
const { register, login, refreshToken } = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/refresh-token", authenticateUser, refreshToken);
router.get("/profile", authenticateUser, (req, res) => {
    res.json({ message: "User profile loaded successfully", user: req.user });
});


module.exports = router;
