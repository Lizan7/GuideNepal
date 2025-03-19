  const express = require('express');
  const cors = require("cors");
  const path = require('path');

  const authRoutes = require("./routes/authRoutes");
  const guideRoutes = require("./routes/guideRoutes");
  const hotelRoutes = require("./routes/hotelRoutes");
  const bookingRoutes = require("./routes/bookingRoutes");
  const hotelbookingRoutes = require("./routes/hotelbookingRoutes");
  const khaltiRoutes = require("./routes/paymentRoutes");
  const { geminiChat } = require('./controllers/geminiController');

  require('dotenv').config();

  const app = express();

  // Middleware to parse JSON bodies
  app.use(express.json());
  app.use(cors());

// Serve images from guideVerification and hotelUploads folders
app.use("/api/guideVerification", express.static(path.join(__dirname, "guideVerification")));
app.use("/api/hotelUploads", express.static(path.join(__dirname, "hotelUploads")));

  app.use("/api/auth", authRoutes);
  app.use("/api/guides", guideRoutes);
  app.use("/api/hotels", hotelRoutes);
  app.use("/api/booking", bookingRoutes);
  app.use("/api/hotelbooking", hotelbookingRoutes);
  app.use("/api/khalti", khaltiRoutes);

  // Map the route to the Gemini controller
app.post('/api/gemini-chat', geminiChat);


  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
