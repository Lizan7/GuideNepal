const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all guides
const getGuides = async (req, res) => {
  try {
    const guides = await prisma.guide.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true, 
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ success: true, guides });
  } catch (error) {
    console.error("Error fetching guides:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all hotels
const getHotels = async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ success: true, hotels });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Verify a guide
const verifyGuide = async (req, res) => {
  try {
    const { guideId } = req.params;

    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(guideId) },
    });

    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    const updatedGuide = await prisma.guide.update({
      where: { id: parseInt(guideId) },
      data: { verified: true },
    });

    return res.status(200).json({
      success: true,
      message: "Guide verified successfully",
      guide: updatedGuide,
    });
  } catch (error) {
    console.error("Error verifying guide:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Verify a hotel
const verifyHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(hotelId) },
    });

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id: parseInt(hotelId) },
      data: { verified: true },
    });

    return res.status(200).json({
      success: true,
      message: "Hotel verified successfully",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("Error verifying hotel:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getUsers,
  getGuides,
  getHotels,
  verifyGuide,
  verifyHotel,
}; 