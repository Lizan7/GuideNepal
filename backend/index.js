const express = require('express');
const cors = require("cors");
const path = require('path');
const http = require("http");
  const { initializeSocket  } = require('./controllers/socketController');

const authRoutes = require("./routes/authRoutes");
const guideRoutes = require("./routes/guideRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const hotelbookingRoutes = require("./routes/hotelbookingRoutes");
const khaltiRoutes = require("./routes/paymentRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const chatRoutes = require("./routes/chatRoutes");
const rateRoutes = require("./routes/ratingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const packageRoutes = require("./routes/packageRoutes");


require('dotenv').config();

const app = express();
const server = http.createServer(app);
  initializeSocket(server);

// Middleware to parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Serve images from guideVerification and hotelUploads folders
app.use("/api/guideVerification", express.static(path.join(__dirname, "guideVerification")));
app.use("/api/hotelUploads", express.static(path.join(__dirname, "hotelUploads")));

app.use("/api/auth", authRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/hotelbooking", hotelbookingRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/rate", rateRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/package", packageRoutes);

app.use("/api/admin", adminRoutes);


const PORT = process.env.PORT || 3200;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
