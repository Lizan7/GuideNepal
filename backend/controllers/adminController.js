const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


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
  verifyGuide,
  verifyHotel,
}; 