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
        paymentStatus: true,
        OR: [
          {
            // Case 1: New booking starts during an existing booking
            AND: [
              { startDate: { gte: start } },
              { startDate: { lte: end } }
            ]
          },
          {
            // Case 2: New booking ends during an existing booking
            AND: [
              { endDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          },
          {
            // Case 3: New booking completely encompasses an existing booking
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: end } }
            ]
          },
          {
            // Case 4: New booking starts before and ends during an existing booking
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          },
          {
            // Case 5: New booking starts during and ends after an existing booking
            AND: [
              { startDate: { gte: start } },
              { startDate: { lte: end } },
              { endDate: { gte: end } }
            ]
          }
        ],
      },
    });

    if (existingBooking) {
      // Check if the existing booking is by the same user
      if (existingBooking.userId === parseInt(userId)) {
        return res.status(400).json({ 
          error: "You have already booked this guide for these dates.",
          existingBooking: {
            startDate: existingBooking.startDate,
            endDate: existingBooking.endDate
          }
        });
      } else {
        return res.status(400).json({ 
          error: "This guide is not available between these dates as they are already booked.",
          existingBooking: {
            startDate: existingBooking.startDate,
            endDate: existingBooking.endDate
          }
        });
      }
    }

    // Create booking for multiple days
    const newBooking = await prisma.userBooking.create({
      data: {
        userId: parseInt(userId),
        guideId: parseInt(guideId),
        startDate: start,
        endDate: end,
        paymentStatus: paymentStatus ?? false
      },
    });

    return res.status(201).json({ 
      success: true, 
      message: "Booking successful!", 
      booking: newBooking 
    });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create Hotel Booking with Room Availability Check
const createHotelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hotelId, startDate, endDate, numberOfRooms, paymentStatus } = req.body;

    // Validate input
    if (!hotelId || !startDate || !endDate || !numberOfRooms) {
      return res.status(400).json({ 
        error: "Hotel ID, start date, end date, and number of rooms are required." 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ error: "Start date must be before end date." });
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Ensure hotel exists and get total rooms
    const hotel = await prisma.hotel.findUnique({ 
      where: { id: parseInt(hotelId) },
      select: { 
        id: true, 
        totalRooms: true,
        verified: true 
      }
    });

    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    if (!hotel.verified) return res.status(400).json({ error: "Hotel is not verified yet." });

    // Check room availability for the given dates
    const existingBookings = await prisma.hotelBooking.findMany({
      where: {
        hotelId: parseInt(hotelId),
        paymentStatus: true,
        OR: [
          {
            // Case 1: New booking starts during an existing booking
            AND: [
              { startDate: { gte: start } },
              { startDate: { lte: end } }
            ]
          },
          {
            // Case 2: New booking ends during an existing booking
            AND: [
              { endDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          },
          {
            // Case 3: New booking completely encompasses an existing booking
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: end } }
            ]
          },
          {
            // Case 4: New booking starts before and ends during an existing booking
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          },
          {
            // Case 5: New booking starts during and ends after an existing booking
            AND: [
              { startDate: { gte: start } },
              { startDate: { lte: end } },
              { endDate: { gte: end } }
            ]
          }
        ],
      },
    });

    // Calculate total booked rooms for the date range
    const totalBookedRooms = existingBookings.reduce((sum, booking) => sum + booking.rooms, 0);
    const availableRooms = hotel.roomsAvailable - totalBookedRooms;

    if (numberOfRooms > availableRooms) {
      // Check if the user has already booked rooms for these dates
      const userExistingBooking = existingBookings.find(booking => booking.userId === parseInt(userId));
      
      if (userExistingBooking) {
        return res.status(400).json({ 
          error: "You have already booked rooms for these dates.",
          existingBooking: {
            startDate: userExistingBooking.startDate,
            endDate: userExistingBooking.endDate,
            rooms: userExistingBooking.rooms
          }
        });
      } else {
        return res.status(400).json({ 
          error: "Not enough rooms available for the selected dates.",
          availableRooms,
          requestedRooms: numberOfRooms,
          existingBookings: existingBookings.map(booking => ({
            startDate: booking.startDate,
            endDate: booking.endDate,
            rooms: booking.rooms
          }))
        });
      }
    }

    // Create hotel booking
    const newBooking = await prisma.hotelBooking.create({
      data: {
        userId: parseInt(userId),
        hotelId: parseInt(hotelId),
        startDate: start,
        endDate: end,
        numberOfRooms,
        paymentStatus: paymentStatus ?? false,
        status: paymentStatus ? "confirmed" : "pending"
      },
    });

    return res.status(201).json({ 
      success: true, 
      message: "Hotel booking successful!", 
      booking: newBooking 
    });
  } catch (error) {
    console.error("Hotel Booking Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get All Bookings (Guides and Hotels) for a User
const getUserBookings = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    // Fetch Guide Bookings
    const guideBookings = await prisma.userBooking.findMany({
      where: { userId },
      include: {
        guide: {
          select: {
            id: true,
            email: true,
            specialization: true,
            profileImage: true,
            user: {
              select: {
                name: true
              }
            }
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    // Fetch Hotel Bookings
    const hotelBookings = await prisma.hotelBooking.findMany({
      where: { userId },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            location: true,
            price: true,
            profileImage: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    // Combine bookings
    const bookings = {
      guideBookings,
      hotelBookings,
    };

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

// Check guide availability for specific dates
const checkGuideAvailability = async (req, res) => {
  try {
    const { guideId, startDate, endDate } = req.body;
    const userId = req.user.id;

    console.log("Checking guide availability for:", {
      guideId,
      startDate,
      endDate,
      userId
    });

    // Validate input
    if (!guideId || !startDate || !endDate) {
      console.log("Missing required fields:", { guideId, startDate, endDate });
      return res.status(400).json({ 
        error: "Guide ID, start date, and end date are required." 
      });
    }

    // Parse guideId to ensure it's a number
    const parsedGuideId = parseInt(guideId);
    if (isNaN(parsedGuideId)) {
      console.log("Invalid guide ID format:", guideId);
      return res.status(400).json({ 
        error: "Invalid guide ID format." 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log("Parsed dates:", {
      start: start.toISOString(),
      end: end.toISOString()
    });

    if (start > end) {
      console.log("Invalid date range: start date is after end date");
      return res.status(400).json({ error: "Start date must be before end date." });
    }

    // Ensure guide exists
    const guide = await prisma.guide.findUnique({ 
      where: { id: parsedGuideId },
      select: { id: true }
    });

    console.log("Found guide:", guide);

    if (!guide) {
      console.log("Guide not found with ID:", parsedGuideId);
      return res.status(404).json({ error: "Guide not found" });
    }

    // Check if there are overlapping bookings
    console.log("Checking for overlapping bookings...");
    
    // First, get all bookings for this guide to log them
    const allGuideBookings = await prisma.userBooking.findMany({
      where: {
        guideId: parsedGuideId,
        paymentStatus: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log("All bookings for guide:", parsedGuideId);
    allGuideBookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`, {
        id: booking.id,
        userId: booking.userId,
        startDate: booking.startDate.toISOString().split('T')[0],
        endDate: booking.endDate.toISOString().split('T')[0]
      });
    });
    
    // Check for any overlapping bookings using a more direct approach
    let isOverlapping = false;
    let overlappingBooking = null;
    
    for (const booking of allGuideBookings) {
      // Normalize dates by setting time to midnight
      const bookingStart = new Date(booking.startDate);
      bookingStart.setHours(0, 0, 0, 0);
      
      const bookingEnd = new Date(booking.endDate);
      bookingEnd.setHours(23, 59, 59, 999);
      
      const requestStart = new Date(start);
      requestStart.setHours(0, 0, 0, 0);
      
      const requestEnd = new Date(end);
      requestEnd.setHours(23, 59, 59, 999);
      
      console.log("Comparing normalized dates:", {
        bookingStart: bookingStart.toISOString(),
        bookingEnd: bookingEnd.toISOString(),
        requestStart: requestStart.toISOString(),
        requestEnd: requestEnd.toISOString()
      });
      
      // Check if the new booking overlaps with this existing booking
      if (requestStart <= bookingEnd && requestEnd >= bookingStart) {
        console.log("Overlap detected!");
        isOverlapping = true;
        overlappingBooking = booking;
        break;
      }
    }
    
    console.log("Overlap check result:", isOverlapping ? "Found overlap" : "No overlap");

    if (isOverlapping && overlappingBooking) {
      console.log("Found overlapping booking:", {
        id: overlappingBooking.id,
        userId: overlappingBooking.userId,
        startDate: overlappingBooking.startDate,
        endDate: overlappingBooking.endDate
      });
      
      return res.status(200).json({ 
        available: false,
        existingBooking: {
          startDate: overlappingBooking.startDate,
          endDate: overlappingBooking.endDate,
          userId: overlappingBooking.userId
        }
      });
    }

    console.log("No overlapping bookings found, guide is available");
    return res.status(200).json({ available: true });
  } catch (error) {
    console.error("Availability Check Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all bookings for a hotel
const getHotelBookings = async (req, res) => {
  try {
    const hotelId = req.user.id;

    // Ensure hotel exists
    const hotel = await prisma.hotel.findUnique({ where: { userId: parseInt(hotelId) } });
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    const bookings = await prisma.hotelBooking.findMany({
      where: { hotelId: hotel.id },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching hotel bookings:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { 
  createUserBooking, 
  createHotelBooking,
  getUserBookings, 
  getGuideBookings,
  checkGuideAvailability,
  getHotelBookings
};
