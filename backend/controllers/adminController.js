const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all guides
const getAllGuides = async (req, res) => {
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
    });

    return res.status(200).json({
      success: true,
      guides,
    });
  } catch (error) {
    console.error("Error fetching guides:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all hotels
const getAllHotels = async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      hotels,
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get guide details
const getGuideDetails = async (req, res) => {
  try {
    const { guideId } = req.params;

    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(guideId) },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    return res.status(200).json({
      success: true,
      guide,
    });
  } catch (error) {
    console.error("Error fetching guide details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get hotel details
const getHotelDetails = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(hotelId) },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    return res.status(200).json({
      success: true,
      hotel,
    });
  } catch (error) {
    console.error("Error fetching hotel details:", error);
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
      data: { isVerified: true },
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
      data: { isVerified: true },
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

// Reject a guide
const rejectGuide = async (req, res) => {
  try {
    const { guideId } = req.params;
    const { reason } = req.body;

    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(guideId) },
    });

    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    // You could add a rejected field to the guide model if needed
    // For now, we'll just return a success message
    return res.status(200).json({
      success: true,
      message: "Guide rejected successfully",
      reason,
    });
  } catch (error) {
    console.error("Error rejecting guide:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Reject a hotel
const rejectHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { reason } = req.body;

    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(hotelId) },
    });

    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    // You could add a rejected field to the hotel model if needed
    // For now, we'll just return a success message
    return res.status(200).json({
      success: true,
      message: "Hotel rejected successfully",
      reason,
    });
  } catch (error) {
    console.error("Error rejecting hotel:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalGuides = await prisma.guide.count();
    const verifiedGuides = await prisma.guide.count({
      where: { isVerified: true },
    });
    const totalHotels = await prisma.hotel.count();
    const verifiedHotels = await prisma.hotel.count({
      where: { isVerified: true },
    });
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalGuides,
        verifiedGuides,
        pendingGuides: totalGuides - verifiedGuides,
        totalHotels,
        verifiedHotels,
        pendingHotels: totalHotels - verifiedHotels,
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllGuides,
  getAllHotels,
  getGuideDetails,
  getHotelDetails,
  verifyGuide,
  verifyHotel,
  rejectGuide,
  rejectHotel,
  getDashboardStats,
}; 