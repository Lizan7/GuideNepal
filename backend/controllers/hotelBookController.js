const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create Hotel Booking with Multiple Days
const createHotelBooking = async (req, res) => {
    try {
      console.log("🔹 Request Body:", req.body); // ✅ Log request data
  
      const { userId, hotelId, startDate, endDate, rooms, paymentStatus } = req.body;
  
      if (!userId || !hotelId || !startDate || !endDate || !rooms) {
        return res.status(400).json({ error: "All fields are required." });
      }
  
      const newBooking = await prisma.hotelBooking.create({
        data: {
          userId: parseInt(userId),
          hotelId: parseInt(hotelId),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          rooms: parseInt(rooms),
          paymentStatus: paymentStatus ?? false,
        },
      });
  
      console.log("✅ Booking Created:", newBooking);
      return res.status(201).json({ success: true, message: "Booking successful!", booking: newBooking });
    } catch (error) {
      console.error("❌ Booking Error:", error);
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  };
  

// Get All Hotel Bookings for a User
const getUserHotelBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.hotelBooking.findMany({
      where: { userId: parseInt(userId) },
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

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching user hotel bookings:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get All Bookings for a Hotel Owner
const getHotelOwnerBookings = async (req, res) => {
  try {
    const hotelOwnerId = req.user.id;

    // Ensure hotel exists
    const hotel = await prisma.hotel.findFirst({ where: { userId: parseInt(hotelOwnerId) } });
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });

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

module.exports = { createHotelBooking, getUserHotelBookings, getHotelOwnerBookings };
