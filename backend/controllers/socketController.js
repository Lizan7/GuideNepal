const socketIo = require('socket.io');
let io = null;
const userSocketMap = {};

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Replace with your frontend URL in production
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", socket => {
    console.log("New client connected:", socket.id);
    
    // Handle user identification
    socket.on("identify", (userId) => {
      if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} mapped to socket ${socket.id}`);
        // Confirm successful connection to client
        socket.emit("connected", { status: "connected", userId });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Remove user from socket map
      const userId = Object.keys(userSocketMap).find(
        key => userSocketMap[key] === socket.id
      );
      if (userId) {
        delete userSocketMap[userId];
        console.log(`Removed user ${userId} from socket map`);
      }
    });

    // Handle message sending
    socket.on("sendMessage", (messageData) => {
      console.log("Received message:", messageData);
      const { senderId, receiverId, message, timestamp } = messageData;
      
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          senderId,
          receiverId,
          message,
          timestamp: timestamp || new Date().toISOString()
        });
      } else {
        console.log('Receiver ${receiverId} is not connected');
      }
    });
  });

  return io;
};

module.exports = {
  io,
  userSocketMap,
  initializeSocket
};