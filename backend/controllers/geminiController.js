// geminiController.js
require('dotenv').config();
const axios = require('axios');

const geminiChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const geminiResponse = await axios.post(
      process.env.GEMINI_API_URL, // Ensure this URL is correct!
      { prompt: message },        // Adjust the body as per Gemini API docs
      {
        headers: {
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the response structure matches what we expect.
    const reply = geminiResponse.data.reply || geminiResponse.data.response || "No reply received";
    return res.json({ reply });
  } catch (error) {
    console.error("Error calling Gemini API:", error.response?.data || error.message);
    // Return the detailed error if needed for debugging (remove in production)
    return res.status(500).json({ error: "Internal Server Error", details: error.response?.data });
  }
};

module.exports = { geminiChat };
