const express = require('express');
const cors = require("cors");
const authRoutes = require("./routes/authRoutes"); 
const guideRoutes = require("./routes/guideRoutes");
const userRoutes = require("./routes/userRoutes");

require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors());

app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/guides", guideRoutes);


// Start the server on the port specified in .env or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
