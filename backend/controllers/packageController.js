const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/packageImages/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  },
});

const upload = multer({ storage: storage }).single("image");

// Create a new package
const createPackage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ error: "File upload failed" });
    }

    try {
      const {
        title,
        description,
        duration,
        maxPeople,
        locations,
        price,
      } = req.body;

      // Get the guide ID from the authenticated user
      const userId = req.user.id;

      // Validate required fields
      if (!title || !description || !duration || !maxPeople || !locations || !price) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }

      // Check if a Guide record exists for this user
      let guide = await prisma.guide.findUnique({
        where: { userId: parseInt(userId) }
      });

      // If no Guide record exists, create one
      if (!guide) {
        console.log("Creating new Guide record for user:", userId);
        guide = await prisma.guide.create({
          data: {
            userId: parseInt(userId),
            name: req.user.name || "Guide",
            email: req.user.email || "",
            phoneNumber: "",
            location: "",
            specialization: "",
            isVerified: false
          }
        });
      }

      // Handle image upload
      let packageImage = null;
      if (req.file) {
        packageImage = `packageImages/${req.file.filename}`;
      }

      // Handle locations - convert to array if string, then to JSON
      let locationsArray;
      if (typeof locations === 'string') {
        // If it's a comma-separated string, split it
        locationsArray = locations.split(',').map(loc => loc.trim());
      } else if (Array.isArray(locations)) {
        // If it's already an array, use it as is
        locationsArray = locations;
      } else {
        return res.status(400).json({
          success: false,
          message: "Locations must be either a string or an array",
        });
      }

      // Convert locations array to JSON string
      const locationsJson = JSON.stringify(locationsArray);

      // Create package in database
      const newPackage = await prisma.package.create({
        data: {
          title,
          description,
          duration: parseInt(duration),
          maxPeople: parseInt(maxPeople),
          locations: locationsJson,
          price: parseFloat(price),
          image: packageImage,
          guide: {
            connect: { id: guide.id }
          }
        },
      });

      // Parse locations back to array for response
      const responsePackage = {
        ...newPackage,
        locations: JSON.parse(newPackage.locations)
      };

      res.status(201).json({
        success: true,
        message: "Package created successfully",
        data: responsePackage,
      });
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({
        success: false,
        message: "Error creating package",
        error: error.message,
      });
    }
  });
};

// Get all packages
const getAllPackages = async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      include: {
        guide: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        enrollments: true,
      },
    });

    // Parse locations JSON for each package with error handling
    const packagesWithParsedLocations = packages.map((pkg) => {
      try {
        // Try to parse the locations JSON
        const parsedLocations = JSON.parse(pkg.locations);
        return {
          ...pkg,
          locations: parsedLocations,
          currentEnrollments: pkg.enrollments?.length || 0,
          isFulfilled: (pkg.enrollments?.length || 0) >= pkg.maxPeople,
        };
      } catch (parseError) {
        console.error(`Error parsing locations for package ${pkg.id}:`, parseError);
        // If parsing fails, return the original locations as a string
        return {
          ...pkg,
          locations: pkg.locations,
          currentEnrollments: pkg.enrollments?.length || 0,
          isFulfilled: (pkg.enrollments?.length || 0) >= pkg.maxPeople,
        };
      }
    });

    res.status(200).json({
      success: true,
      data: packagesWithParsedLocations,
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching packages",
      error: error.message,
    });
  }
};

// Get packages by guide ID
const getGuidePackages = async (req, res) => {
  try {
    const guideId = req.user.id;

    const packages = await prisma.package.findMany({
      where: {
        guideId: guideId,
      },
      include: {
        guide: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Parse locations JSON for each package
    const packagesWithParsedLocations = packages.map(pkg => ({
      ...pkg,
      locations: JSON.parse(pkg.locations)
    }));

    res.status(200).json({
      success: true,
      data: packagesWithParsedLocations,
    });
  } catch (error) {
    console.error("Error fetching guide packages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching guide packages",
      error: error.message,
    });
  }
};

// Update a package
const updatePackage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ error: "File upload failed" });
    }

    try {
      const { id } = req.params;
      const {
        title,
        description,
        duration,
        maxPeople,
        locations,
        price,
      } = req.body;

      // Check if package exists
      const existingPackage = await prisma.package.findUnique({
        where: {
          id: parseInt(id),
        },
      });

      if (!existingPackage) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      // Handle image upload
      let packageImage = existingPackage.image;
      if (req.file) {
        // Delete old image if it exists
        if (existingPackage.image) {
          const oldImagePath = path.join(__dirname, '..', 'uploads', existingPackage.image);
          try {
            fs.unlinkSync(oldImagePath);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }
        packageImage = `packageImages/${req.file.filename}`;
      }

      // Handle locations - convert to array if string, then to JSON
      let locationsArray;
      if (typeof locations === 'string') {
        // If it's a comma-separated string, split it
        locationsArray = locations.split(',').map(loc => loc.trim());
      } else if (Array.isArray(locations)) {
        // If it's already an array, use it as is
        locationsArray = locations;
      } else {
        return res.status(400).json({
          success: false,
          message: "Locations must be either a string or an array",
        });
      }

      // Convert locations array to JSON string
      const locationsJson = JSON.stringify(locationsArray);

      // Update package in database
      const updatedPackage = await prisma.package.update({
        where: { id: parseInt(id) },
        data: {
          title: title || existingPackage.title,
          description: description || existingPackage.description,
          duration: duration ? parseInt(duration) : existingPackage.duration,
          maxPeople: maxPeople ? parseInt(maxPeople) : existingPackage.maxPeople,
          locations: locationsJson || existingPackage.locations,
          price: price ? parseFloat(price) : existingPackage.price,
          image: packageImage,
        },
      });

      // Parse locations back to array for response
      const responsePackage = {
        ...updatedPackage,
        locations: JSON.parse(updatedPackage.locations)
      };

      res.status(200).json({
        success: true,
        message: "Package updated successfully",
        data: responsePackage,
      });
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({
        success: false,
        message: "Error updating package",
        error: error.message,
      });
    }
  });
};

// Delete a package
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if package exists and belongs to the guide
    const existingPackage = await prisma.package.findFirst({
      where: {
        id: id,
        guideId: req.user.id,
      },
    });

    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found or unauthorized",
      });
    }

    // Delete the package image if it exists
    if (existingPackage.image) {
      const imagePath = path.join(__dirname, '..', existingPackage.image);
      try {
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.error("Error deleting package image:", error);
      }
    }

    // Delete package
    await prisma.package.delete({
      where: { id: id },
    });

    res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting package",
      error: error.message,
    });
  }
};

// Get enrolled packages for a user
const getEnrolledPackages = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrolledPackages = await prisma.packageEnrollment.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        package: {
          include: {
            guide: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            enrollments: true,
          },
        },
      },
    });

    // Parse locations and add enrollment info
    const formattedPackages = enrolledPackages.map((enrollment) => {
      const pkg = enrollment.package;
      try {
        return {
          ...pkg,
          locations: JSON.parse(pkg.locations),
          currentEnrollments: pkg.enrollments?.length || 0,
          isFulfilled: (pkg.enrollments?.length || 0) >= pkg.maxPeople,
        };
      } catch (error) {
        return {
          ...pkg,
          locations: pkg.locations,
          currentEnrollments: pkg.enrollments?.length || 0,
          isFulfilled: (pkg.enrollments?.length || 0) >= pkg.maxPeople,
        };
      }
    });

    res.status(200).json({
      success: true,
      data: formattedPackages,
    });
  } catch (error) {
    console.error("Error fetching enrolled packages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrolled packages",
      error: error.message,
    });
  }
};

// Enroll in a package
const enrollInPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const userId = req.user.id;

    // Get the package and check if it exists
    const package = await prisma.package.findUnique({
      where: {
        id: parseInt(packageId)
      },
      include: {
        enrollments: true
      }
    });

    if (!package) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.packageEnrollment.findFirst({
      where: {
        packageId: parseInt(packageId),
        userId: parseInt(userId),
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this package",
      });
    }

    // Check if package is full
    const currentEnrollments = package.enrollments?.length || 0;
    if (currentEnrollments >= package.maxPeople) {
      // Update package status to fulfilled
      await prisma.package.update({
        where: { id: parseInt(packageId) },
        data: { isFulfilled: true },
      });

      return res.status(400).json({
        success: false,
        message: "Package is already full",
      });
    }

    // Create enrollment
    const enrollment = await prisma.packageEnrollment.create({
      data: {
        packageId: parseInt(packageId),
        userId: parseInt(userId),
      },
      include: {
        package: true,
      },
    });

    // Check if this enrollment makes the package full
    if (currentEnrollments + 1 >= package.maxPeople) {
      await prisma.package.update({
        where: { id: parseInt(packageId) },
        data: { isFulfilled: true },
      });
    }

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in package",
      data: enrollment,
    });
  } catch (error) {
    console.error("Error enrolling in package:", error);
    res.status(500).json({
      success: false,
      message: "Error enrolling in package",
      error: error.message,
    });
  }
};

// Get enrolled users for a specific package
const getEnrolledUsers = async (req, res) => {
  try {
    const { packageId } = req.params;
    const userId = req.user.id;

    // First, check if the package exists
    const package = await prisma.package.findUnique({
      where: {
        id: parseInt(packageId),
      },
    });

    if (!package) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Get all enrollments for this package with user details
    const enrollments = await prisma.packageEnrollment.findMany({
      where: {
        packageId: parseInt(packageId),
      },
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
        createdAt: 'desc',
      },
    });

    // Format the response data
    const enrolledUsers = enrollments.map(enrollment => ({
      id: enrollment.user.id,
      name: enrollment.user.name,
      email: enrollment.user.email,
      phone: enrollment.user.phone,
      enrollmentDate: enrollment.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: enrolledUsers,
    });
  } catch (error) {
    console.error("Error fetching enrolled users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrolled users",
      error: error.message,
    });
  }
};

module.exports = {
  createPackage,
  getAllPackages,
  getGuidePackages,
  updatePackage,
  deletePackage,
  getEnrolledPackages,
  enrollInPackage,
  getEnrolledUsers,
};
