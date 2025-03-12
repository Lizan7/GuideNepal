const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create User Booking with Multiple Days
const createUserBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { guideId, startDate, endDate, paymentStatus } = req.body;

    // Validate input
    if (!guideId || !startDate || !endDate) {
      return res.status(400).json({ error: "Guide ID, start date, and end date are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ error: "Start date must be before end date." });
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Ensure guide exists
    const guide = await prisma.guide.findUnique({ where: { id: parseInt(guideId) } });
    if (!guide) return res.status(404).json({ error: "Guide not found" });

    if (guide.userId === userId) {
      return res.status(400).json({ error: "You cannot book yourself as a guide." });
    }

    // Check if there are overlapping bookings
    const existingBooking = await prisma.userBooking.findFirst({
      where: {
        guideId: parseInt(guideId),
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (existingBooking) {
      return res.status(400).json({ error: "This guide is already booked during these dates." });
    }

    // Create booking for multiple days
    const newBooking = await prisma.userBooking.create({
      data: {
        userId: parseInt(userId),
        guideId: parseInt(guideId),
        startDate: start,
        endDate: end,
        paymentStatus: paymentStatus ?? false, // Default to false if not provided
      },
    });

    return res.status(201).json({ success: true, message: "Booking successful!", booking: newBooking });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get All Bookings for a User
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.userBooking.findMany({
      where: { userId: parseInt(userId) },
      include: {
        guide: {
          select: {
            id: true,
            email: true,
            specialization: true,
            profileImage: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get All Bookings for a Guide
const getGuideBookings = async (req, res) => {
  try {
    const guideId = req.user.id;

    // Ensure guide exists
    const guide = await prisma.guide.findUnique({ where: { userId: parseInt(guideId) } });
    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    const bookings = await prisma.userBooking.findMany({
      where: { guideId: guide.id },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching guide bookings:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createUserBooking, getUserBookings, getGuideBookings };
