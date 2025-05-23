const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../guideVerification/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  },
});

const upload = multer({ storage: storage }).fields([
  { name: "profileImage", maxCount: 1 },
  { name: "verificationImage", maxCount: 1 },
]);

const storeGuideDetails = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ error: "File upload failed" });
    }

    try {
      const userId = req.user.id;
      const email = req.user.email;
      const name = req.user.name;
      // Now extracting charge along with other details from req.body
      const { location, phoneNumber, specialization, charge } = req.body;

      // Convert charge to float
      const chargeFloat = parseFloat(charge);

      // Validate user
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.role !== "GUIDE") {
        return res.status(403).json({ error: "Only guides can submit details" });
      }

      // Check if the guide already exists
      const existingGuide = await prisma.guide.findUnique({
        where: { userId: parseInt(userId) },
      });

      let guide;
      if (existingGuide) {
        // Update existing guide
        const updateData = {
          name,
          phoneNumber,
          location,
          specialization,
          email,
          charge: chargeFloat, 
        };

        // Only update images if new ones are provided
        if (req.files) {
          if (req.files["profileImage"]) {
            updateData.profileImage = `/uploads/${req.files["profileImage"][0].filename}`;
          }
          if (req.files["verificationImage"]) {
            updateData.verificationImage = `/uploads/${req.files["verificationImage"][0].filename}`;
          }
        }

        guide = await prisma.guide.update({
          where: { userId: parseInt(userId) },
          data: updateData,
        });
      } else {
        // Create new guide
        const profileImagePath = req.files?.["profileImage"]
          ? `/uploads/${req.files["profileImage"][0].filename}`
          : null;

        const verificationImagePath = req.files?.["verificationImage"]
          ? `/uploads/${req.files["verificationImage"][0].filename}`
          : null;

        guide = await prisma.guide.create({
          data: {
            userId: user.id,
            name,
            phoneNumber,
            location,
            specialization,
            email,
            charge: chargeFloat, // Use the float value
            profileImage: profileImagePath,
            verificationImage: verificationImagePath,
            isVerified: false,
          },
        });
      }

      console.log("Guide successfully stored/updated:", guide);
      return res.status(201).json({
        message: existingGuide ? "Guide details updated successfully" : "Guide details stored successfully",
        guide,
      });
    } catch (error) {
      console.error("Error storing/updating guide details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

const getGuideDetails = async (req, res) => {
  try {
      const guideDetails = await prisma.guide.findMany({
          include: {
              user: {
                select: {
                  email: true,
                  name: true,
                },
              },
          }
      });

      if (!guideDetails.length) {
          return res.status(404).json({ error: "No guides found" });
      }

      return res.status(200).json({ guides: guideDetails });
  } catch (error) {
      console.error("Error fetching guide details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getGuideProfileDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the guide by userId
    const guide = await prisma.guide.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    return res.status(200).json(guide);
  } catch (error) {
    console.error("Error fetching guide profile details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getGuideLocations = async (req, res) => {
  try {
    // Get all unique locations from guides and count guides in each location
    const guides = await prisma.guide.findMany({
      select: {
        location: true,
      },
    });

    // Count guides by location
    const locationCounts = {};
    guides.forEach(guide => {
      if (guide.location) {
        locationCounts[guide.location] = (locationCounts[guide.location] || 0) + 1;
      }
    });

    // Format the response
    const locations = Object.keys(locationCounts).map(name => ({
      name,
      count: locationCounts[name]
    }));

    return res.status(200).json({ locations });
  } catch (error) {
    console.error("Error fetching guide locations:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all guide details
const getAllGuideDetails = async (req, res) => {
  try {
    const guides = await prisma.guide.findMany({
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

    return res.status(200).json({ 
      success: true, 
      guides 
    });
  } catch (error) {
    console.error("Error fetching all guide details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { storeGuideDetails, getGuideDetails, getGuideProfileDetails, getGuideLocations, getAllGuideDetails };
