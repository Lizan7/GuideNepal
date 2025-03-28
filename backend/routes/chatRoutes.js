const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { sendRequest, getRequest, acceptRequest, getFriends, sendMessage, getMessage, getChatUser, receiver } = require("../controllers/chatController");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/users",authenticateUser(), getChatUser);
router.post("/sendRequest",authenticateUser(), sendRequest);
router.get("/getRequest", authenticateUser(), getRequest);
router.post("/acceptRequest", authenticateUser(), acceptRequest);
router.get("/getfriends", authenticateUser(), getFriends);
router.post("/sendMessage", authenticateUser(), sendMessage);
router.post("/getMessage", authenticateUser(), getMessage);
router.post("/receiver", receiver);

module.exports = router;