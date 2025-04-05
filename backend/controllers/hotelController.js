const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

// Storage Configuration for Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../hotelUploads/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).fields([
  { name: "certificate", maxCount: 1 },
  { name: "hotelProfile", maxCount: 1 },
]);

const verifyHotelDetails = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("❌ File upload error:", err);
      return res.status(400).json({ error: "File upload failed", details: err.message });
    }

    try {
      // Extract user info from the token
      if (!req.user || !req.user.id || !req.user.email || !req.user.name) {
        console.error("❌ Unauthorized request: User data is missing from request");
        return res.status(401).json({ error: "Unauthorized - User not found in request" });
      }

      const userId = req.user.id;
      const userEmail = req.user.email;
      const userName = req.user.name;

      console.log(`✅ Processing hotel verification for UserID: ${userId}, Email: ${userEmail}`);

      const { phoneNumber, location, price, itineraries, roomsAvailable } = req.body;

      if (!req.files) {
        console.error("❌ No images uploaded in request");
        return res.status(400).json({ error: "No images uploaded" });
      }

      // Validate user
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        console.error(`❌ User with ID ${userId} not found in database`);
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role !== "HOTEL") {
        console.error(`❌ User ${userId} is not authorized to register a hotel`);
        return res.status(403).json({ error: "Only hotel owners can submit verification details" });
      }

      // Check if the hotel already exists
      const existingHotel = await prisma.hotel.findUnique({
        where: { userId: parseInt(userId) },
      });

      if (existingHotel && existingHotel.isVerified) {
        console.error(`❌ Hotel for UserID: ${userId} is already verified`);
        return res.status(400).json({ error: "Hotel is already verified" });
      }

      // Get file paths
      const certificatePath = req.files["certificate"]
        ? `/hotelUploads/${req.files["certificate"][0].filename}`
        : null;

      const profileImagePath = req.files["hotelProfile"]
        ? `/hotelUploads/${req.files["hotelProfile"][0].filename}`
        : null;

      // Validate required fields
      if (!phoneNumber || !location || !price || !itineraries || !roomsAvailable) {
        console.error("❌ Missing required fields in request body");
        return res.status(400).json({ error: "Missing required fields" });
      }

      // If hotel record exists, update it; otherwise, create a new record
      let hotel;
      if (existingHotel) {
        hotel = await prisma.hotel.update({
          where: { userId: user.id },
          data: {
            phoneNumber,
            location,
            price: parseFloat(price),
            itineraries,
            roomsAvailable: parseInt(roomsAvailable),
            certificate: certificatePath || existingHotel.certificate,
            profileImage: profileImagePath || existingHotel.profileImage,
            isVerified: false, // Needs admin approval
          },
        });
      } else {
        hotel = await prisma.hotel.create({
          data: {
            userId: user.id,
            name: userName,
            email: userEmail,
            phoneNumber,
            location,
            price: parseFloat(price),
            itineraries,
            roomsAvailable: parseInt(roomsAvailable),
            certificate: certificatePath,
            profileImage: profileImagePath,
            isVerified: false,
          },
        });
      }

      console.log("✅ Hotel verification details stored:", hotel);
      return res.status(201).json({
        message: "Hotel verification details stored successfully",
        hotel,
      });
    } catch (error) {
      console.error("❌ Error verifying hotel details:", error);
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  });
};

// Get All Hotels
const getHotels = async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!hotels.length) {
      console.error("❌ No hotels found in database");
      return res.status(404).json({ error: "No hotels found" });
    }

    return res.status(200).json({ hotels });
  } catch (error) {
    console.error("❌ Error fetching hotels:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// Get Hotel by ID
const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await prisma.hotel.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!hotel) {
      console.error(`❌ Hotel with ID ${id} not found`);
      return res.status(404).json({ error: "Hotel not found" });
    }

    return res.status(200).json({ hotel });
  } catch (error) {
    console.error("❌ Error fetching hotel details:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// Get all unique locations from hotels
const getHotelLocations = async (req, res) => {
  try {
    // Get all unique locations from hotels and count hotels in each location
    const hotels = await prisma.hotel.findMany({
      select: {
        location: true,
      },
    });

    // Count hotels by location
    const locationCounts = {};
    hotels.forEach(hotel => {
      if (hotel.location) {
        locationCounts[hotel.location] = (locationCounts[hotel.location] || 0) + 1;
      }
    });

    // Format the response
    const locations = Object.keys(locationCounts).map(name => ({
      name,
      count: locationCounts[name]
    }));

    return res.status(200).json({ locations });
  } catch (error) {
    console.error("Error fetching hotel locations:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all hotel details with comprehensive information
const getAllHotelDetails = async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (!hotels.length) {
      console.error("❌ No hotels found in database");
      return res.status(404).json({ error: "No hotels found" });
    }

    return res.status(200).json({ 
      success: true, 
      hotels 
    });
  } catch (error) {
    console.error("❌ Error fetching all hotel details:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

module.exports = {
  verifyHotelDetails,
  getHotels,
  getHotelById,
  getHotelLocations,
  getAllHotelDetails,
};
