const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new rating for a hotel or guide
const createRating = async (req, res) => {
  try {
    const { userId, userName, hotelId, guideId, rating, review } = req.body;

    // Ensure that either hotelId or guideId is provided, but not both.
    if (!hotelId && !guideId) {
      return res.status(400).json({ error: "Either hotelId or guideId must be provided." });
    }
    if (hotelId && guideId) {
      return res.status(400).json({ error: "Provide only one of hotelId or guideId, not both." });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5 stars." });
    }

    // Create rating record using Prisma
    const newRating = await prisma.rating.create({
      data: {
        userId: parseInt(userId),
        userName,
        rating,
        review,
        hotelId: hotelId ? parseInt(hotelId) : null,
        guideId: guideId ? parseInt(guideId) : null,
      },
    });

    return res.status(201).json({ success: true, message: "Rating added successfully.", rating: newRating });
  } catch (error) {
    console.error("Error adding rating:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Retrieve all ratings and reviews for a specific hotel or guide
// Route pattern: GET /ratings/:type/:id  where type is either 'hotel' or 'guide'
const getRatings = async (req, res) => {
  try {
    const { type, id } = req.params;
    let query = {};

    if (type === "hotel") {
      query = { hotelId: parseInt(id) };
    } else if (type === "guide") {
      query = { guideId: parseInt(id) };
    } else {
      return res.status(400).json({ error: 'Invalid type. Must be "hotel" or "guide".' });
    }

    const ratings = await prisma.rating.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, ratings });
  } catch (error) {
    console.error("Error retrieving ratings:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createRating, getRatings };
