const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create User Booking
const createUserBooking = async (req, res) => {
  try {
    // Get userId from authenticated request
    const userId = req.user.id;
    const { guideId, bookingDate, paymentStatus } = req.body;

    // Validate input
    if (!guideId || !bookingDate) {
      return res.status(400).json({ error: "Guide ID and booking date are required." });
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure guide exists
    const guide = await prisma.guide.findUnique({ where: { id: parseInt(guideId) } });
    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    // Prevent users from booking themselves as a guide (if applicable)
    if (guide.userId === userId) {
      return res.status(400).json({ error: "You cannot book yourself as a guide." });
    }

    // Check if booking already exists for the same user, guide, and date
    const existingBooking = await prisma.userBooking.findFirst({
      where: {
        userId: parseInt(userId),
        guideId: parseInt(guideId),
        bookingDate: new Date(bookingDate),
      },
    });

    if (existingBooking) {
      return res.status(400).json({ error: "You already have a booking with this guide on the selected date." });
    }

    // Create booking in the database
    const newBooking = await prisma.userBooking.create({
      data: {
        userId: parseInt(userId),
        guideId: parseInt(guideId),
        bookingDate: new Date(bookingDate),
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
      const userId = req.user.id; // Get logged-in user ID
  
      const bookings = await prisma.userBooking.findMany({
        where: { userId: parseInt(userId) },
        include: {
          guide: {
            select: {
              id: true,
              email: true,
              specialization: true, // ✅ Add `true` to properly select the specialization field
              profileImage: true,
            },
          },
        },
        orderBy: { bookingDate: "desc" },
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
    const guideId = req.user.id; // Ensure guide is logged in

    // Ensure guide exists
    const guide = await prisma.guide.findUnique({ where: { userId: parseInt(guideId) } });
    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    const bookings = await prisma.userBooking.findMany({
      where: { guideId: guide.id },
      include: {
        user: { select: { id: true, email: true, name: true } }, // Include user details
      },
      orderBy: { bookingDate: "desc" },
    });

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching guide bookings:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createUserBooking, getUserBookings, getGuideBookings };
