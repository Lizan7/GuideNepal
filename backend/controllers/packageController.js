const { PrismaClient } = require("@prisma/client");

const fs = require('fs').promises;
const path = require('path');

// Helper function to save base64 image
const saveBase64Image = async (base64String, directory) => {
  try {
    if (!base64String) return null;

    // Create directory if it doesn't exist
    const uploadDir = path.join(__dirname, '..', 'uploads', directory);
    await fs.mkdir(uploadDir, { recursive: true });

    // Extract the base64 data and file extension
    const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const fileExtension = matches[1];
    const base64Data = matches[2];

    // Generate unique filename
    const filename = `package-${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;
    const filePath = path.join(uploadDir, filename);

    // Save the file
    await fs.writeFile(filePath, base64Data, 'base64');

    // Return the relative path
    return `${directory}/${filename}`;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    return null;
  }
};

// Create a new package
const createPackage = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      maxPeople,
      locations,
      price,
      image, // This will be a base64 string
    } = req.body;

    // Get the guide ID from the authenticated user
    const guideId = req.user.id;

    // Validate required fields
    if (!title || !description || !duration || !maxPeople || !locations || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Handle base64 image if provided
    let packageImage = null;
    if (image) {
      packageImage = await saveBase64Image(image, 'packageImages');
    }

    // Convert locations string to array if it's a string
    const locationArray = typeof locations === 'string' 
      ? locations.split(',').map(loc => loc.trim())
      : locations;

    // Create package in database
    const newPackage = await prisma.package.create({
      data: {
        title,
        description,
        duration: parseInt(duration),
        maxPeople: parseInt(maxPeople),
        locations: locationArray,
        price: parseFloat(price),
        image: packageImage,
        guide: {
          connect: { id: guideId }
        }
      },
    });

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: newPackage,
    });
  } catch (error) {
    console.error("Error creating package:", error);
    res.status(500).json({
      success: false,
      message: "Error creating package",
      error: error.message,
    });
  }
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
      },
    });

    res.status(200).json({
      success: true,
      data: packages,
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

    res.status(200).json({
      success: true,
      data: packages,
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
  try {
    const { id } = req.params;
    const {
      title,
      description,
      duration,
      maxPeople,
      locations,
      price,
      image, // This will be a base64 string
    } = req.body;

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

    // Handle base64 image if provided
    let packageImage = existingPackage.image;
    if (image) {
      packageImage = await saveBase64Image(image, 'packageImages');
      // Delete old image if it exists and new image was successfully saved
      if (packageImage && existingPackage.image) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', existingPackage.image);
        await fs.unlink(oldImagePath).catch(() => {});
      }
    }

    // Convert locations string to array if it's a string
    const locationArray = typeof locations === 'string'
      ? locations.split(',').map(loc => loc.trim())
      : locations;

    // Update package
    const updatedPackage = await prisma.package.update({
      where: { id: id },
      data: {
        title: title || existingPackage.title,
        description: description || existingPackage.description,
        duration: duration ? parseInt(duration) : existingPackage.duration,
        maxPeople: maxPeople ? parseInt(maxPeople) : existingPackage.maxPeople,
        locations: locationArray || existingPackage.locations,
        price: price ? parseFloat(price) : existingPackage.price,
        image: packageImage,
      },
    });

    res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: updatedPackage,
    });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({
      success: false,
      message: "Error updating package",
      error: error.message,
    });
  }
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
      const imagePath = path.join(__dirname, '..', 'uploads', existingPackage.image);
      await fs.unlink(imagePath).catch(() => {});
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

module.exports = {
  createPackage,
  getAllPackages,
  getGuidePackages,
  updatePackage,
  deletePackage,
};
