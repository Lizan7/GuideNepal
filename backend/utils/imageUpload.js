const fs = require('fs').promises;
const path = require('path');

/**
 * Uploads an image file to the specified directory
 * @param {Object} file - The file object from multer
 * @param {String} directory - The target directory name (e.g., 'packageImages')
 * @returns {Promise<String>} The path of the uploaded file relative to the uploads directory
 */
const uploadImage = async (file, directory) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create directory if it doesn't exist
    const uploadDir = path.join(__dirname, '..', 'uploads', directory);
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + fileExtension;

    // Move file to uploads directory
    const filePath = path.join(uploadDir, filename);
    await fs.rename(file.path, filePath);

    // Return the relative path
    return `${directory}/${filename}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Deletes an image file from the uploads directory
 * @param {String} filePath - The relative path of the file to delete
 * @returns {Promise<void>}
 */
const deleteImage = async (filePath) => {
  try {
    if (!filePath) return;

    const fullPath = path.join(__dirname, '..', 'uploads', filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error as this is not critical
  }
};

module.exports = {
  uploadImage,
  deleteImage
}; 