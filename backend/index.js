const express = require('express');
require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route for the home page
app.get('/', (req, res) => {
  res.send('Hello, World!');
});


// Start the server on the port specified in .env or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
