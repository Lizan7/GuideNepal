const { PrismaClient } = require("@prisma/client"); 
const prisma = new PrismaClient();
const { io, userSocketMap } = require('./socketController'); 


const getChatUser = async (req, res) => {
  try {
    const userId = req.user.id;
      const users = await prisma.user.findMany({
      where: {  
        id: {
          not: parseInt(userId),
        },
      },
    });
    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
const receiver = async (req, res) => {
  try {
    const { guideId } = req.body;
console.log(guideId);
    const receiver = await prisma.guide.findFirst({
      where: { id: parseInt(guideId) },
    });

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    console.log(receiver.userId);
    res.status(200).json(receiver.userId);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) },
    });

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Create a new request in the database
    const newRequest = await prisma.request.create({
      data: {
        fromId: parseInt(senderId),
        userId: parseInt(receiverId),
        message: message,
        status: "pending",
      },
    });

    const result = await prisma.$transaction(async (prisma) => {
      const areFriends = await prisma.user.findFirst({
        where: { 
          id: parseInt(senderId),
          friends: { some: { id: parseInt(receiverId) } }
        }
      });
      if (!areFriends) {
        console.log(`Users ${senderId} and ${receiverId} are not friends. Adding as friends.`);
        
        await prisma.user.update({
          where: { id: parseInt(senderId) },
          data: {
            friends: { connect: { id: parseInt(receiverId) } },
          },
        });  
        await prisma.user.update({
          where: { id: parseInt(receiverId) },
          data: {
            friends: { connect: { id: parseInt(senderId) } },
          },
        });
        
      }
       // Create a new request in the database
    const newRequest = await prisma.request.create({
      data: {
        fromId: parseInt(senderId),
        userId: parseInt(receiverId),
        message: message,
        status: "pending",
      },
    });
    return newRequest;
    });

    res
      .status(200)
      .json({ message: "Friend request sent", request: newRequest });
  } catch (error) {
    console.error("Error sending request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching requests sent by:", userId);

    const requests = await prisma.request.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        from: true,
      },
    });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.body;

    console.log(req.body);
    if (!requestId || isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    // Check if the request exists
    const request = await prisma.request.findFirst({
      where: { id: Number(requestId) },
      include: { from: true, user: true },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Ensure the request belongs to the logged-in user
    if (request.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    // Delete the request after acceptance
    await prisma.request.delete({
      where: { id: request.id },
    });

    // Add both users to each other's friends list
    const updatedUser = await prisma.user.update({
      where: { id: request.userId },
      data: {
        friends: { connect: { id: request.fromId } },
      },
    });

    const friendUser = await prisma.user.update({
      where: { id: request.fromId },
      data: {
        friends: { connect: { id: request.userId } },
      },
    });

    if (!updatedUser || !friendUser) {
      return res.status(500).json({ message: "Failed to update friends list" });
    }

    return res.status(200).json({ message: "Request accepted successfully" });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findFirst({
      where: { id: parseInt(userId) },
      include: {
        friends: {
          select: {
            id: true,
            name: true,
            email: true
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ friends: user.friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    // Validate input
    if (!receiverId || !message) {
      return res.status(400).json({ 
        message: "Both receiverId and message are required" 
      });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) }
    });

    if (!receiver) {
      return res.status(404).json({ 
        message: "Receiver not found" 
      });
    }
    const result = await prisma.$transaction(async (prisma) => {
      const areFriends = await prisma.user.findFirst({
        where: { 
          id: parseInt(senderId),
          friends: { some: { id: parseInt(receiverId) } }
        }
      });
      
      // If not friends, make them friends
      if (!areFriends) {
        console.log(`Users ${senderId} and ${receiverId} are not friends. Adding as friends.`);
       // Add both users to each other's friends list
       await prisma.user.update({
        where: { id:parseInt(senderId) },
        data: {
          friends: { connect: { id: parseInt(receiverId) } },
        },
      });

      await prisma.user.update({
        where: { id: parseInt(receiverId) },
        data: {
          friends: { connect: { id: parseInt(senderId) } },
        },
      });
    }

    // Create message in database
    const newMessage = await prisma.message.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        message: message,
      },
      include: {
        sender: {
          select: { id: true, name: true }
        },
        receiver: {
          select: { id: true, name: true }
        }
      }
    });
    return newMessage;
    });

    // Emit to socket if receiver is online
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit("receiveMessage", {
        id: result.id,
        senderId: parseInt(senderId),
        message: message,
        createdAt: result.createdAt,
        sender: result.sender,
        receiver: result.receiver
      });
    } else {
      console.log(`Receiver ${receiverId} is not currently online`);
    }

    res.status(201).json({ 
      success: true,
      message: "Message sent successfully",
      data: result 
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send message",
      error: error.message 
    });
  }
};

const getMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body; 
    console.log(receiverId);

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "SenderId and ReceiverId are required.",
      });
    }


    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(senderId), receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: parseInt(senderId) },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};


module.exports = {
  getChatUser,
  sendRequest,
  getRequest,
  acceptRequest,
  getFriends,
  sendMessage,
  getMessage,
  receiver
};