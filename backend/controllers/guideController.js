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
        console.log('usersr', req.user);
        const { location, phoneNumber, specialization } = req.body;
      if (!req.files) {
        return res.status(400).json({ error: "No images uploaded." });
      }

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

      if (existingGuide) {
        return res.status(400).json({ error: "Guide details already exist" });
      }

      // Get file paths
      const profileImagePath = req.files["profileImage"]
        ? `/uploads/${req.files["profileImage"][0].filename}`
        : null;

      const verificationImagePath = req.files["verificationImage"]
        ? `/uploads/${req.files["verificationImage"][0].filename}`
        : null;

      const guide = await prisma.guide.create({
        data: {
          userId: user.id,
          name: userName,
          phoneNumber,
          location,
          specialization,
          email:email,
          profileImage: profileImagePath, 
          verificationImage: verificationImagePath,
          isVerified: false
        },
      });

      console.log("Guide successfully stored:", guide);
      return res.status(201).json({
        message: "Guide details stored successfully",
        guide,
      });
    } catch (error) {
      console.error("Error storing guide details:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};


const getGuideDetails = async (req, res) => {
  try {
      const guideDetails = await prisma.guide.findMany({ // Fetch all guides
          include: {
              user: {
                select: {
                  email: true,
                  name: true,
                },
              }
          }
      });

      if (!guideDetails.length) {
          return res.status(404).json({ error: "No guides found" });
      }

      return res.status(200).json({ guides: guideDetails }); // Return an array
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

    // Return the guide details
    return res.status(200).json(guide);
  } catch (error) {
    console.error("Error fetching guide profile details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { storeGuideDetails, getGuideDetails, getGuideProfileDetails };