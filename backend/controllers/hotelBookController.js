const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require("axios");

// Create Hotel Booking with Multiple Days
const createHotelBooking = async (req, res) => {
    try {
      console.log("🔹 Request Body:", req.body); // ✅ Log request data
  
      const userId = req.user.id; // Get userId from token
      const { hotelId, startDate, endDate, rooms, paymentStatus, pidx } = req.body;
  
      if (!hotelId || !startDate || !endDate || !rooms) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Validate number of rooms (maximum 5)
      if (rooms < 1 || rooms > 5) {
        return res.status(400).json({ error: "Number of rooms must be between 1 and 5." });
      }

      // Get hotel details to calculate price
      const hotel = await prisma.hotel.findUnique({
        where: { id: parseInt(hotelId) }
      });

      if (!hotel) {
        return res.status(404).json({ error: "Hotel not found." });
      }

      // Calculate number of nights
      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      // Calculate total price (price per night * number of rooms * number of nights)
      const totalPrice = hotel.price * rooms * nights;

      // Check if payment is required
      if (!paymentStatus) {
        return res.status(400).json({ 
          error: "Payment is required for booking.",
          totalPrice: totalPrice,
          nights: nights,
          pricePerNight: hotel.price,
          rooms: rooms
        });
      }

      // Create the booking without verifying payment again
      const newBooking = await prisma.hotelBooking.create({
        data: {
          userId: parseInt(userId),
          hotelId: parseInt(hotelId),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          rooms: parseInt(rooms),
          paymentStatus: true,
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
