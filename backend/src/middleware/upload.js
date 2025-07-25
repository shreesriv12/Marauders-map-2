import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../utils/cloudinary.js'; // Path to your Cloudinary config

// Configure Multer to store files in memory (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Uploads a buffer (image data) to Cloudinary.
 * @param {Buffer} buffer - The image buffer from multer.
 * @returns {Promise<string>} A promise that resolves with the secure URL of the uploaded image.
 */
const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    // Create an upload stream to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'hogwarts_avatars' }, // Optional: specify a folder in Cloudinary
      (error, result) => {
        if (result) {
          resolve(result.secure_url); // Resolve with the secure URL
        } else {
          // Log the Cloudinary error here for better debugging
          console.error('Cloudinary upload stream error:', error);
          reject(error); // Reject with the error
        }
      }
    );
    // Pipe the buffer into the Cloudinary upload stream
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export { upload, uploadToCloudinary };