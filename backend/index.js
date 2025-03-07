  const express = require('express');
  const cors = require("cors");
  const path = require('path');

  const authRoutes = require("./routes/authRoutes");
  const guideRoutes = require("./routes/guideRoutes");
  const bookingRoutes = require("./routes/bookingRoutes");

  require('dotenv').config();

  const app = express();

  // Middleware to parse JSON bodies
  app.use(express.json());
  app.use(cors());

  // ✅ Serve static files from the 'uploads' directory
  app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

  app.use("/api/auth", authRoutes);
  app.use("/api/guides", guideRoutes);
  app.use("/api/booking", bookingRoutes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
