import express from 'express';
import { signup, login } from '../controllers/authController.js'; // Import controller functions
import { upload } from '../middleware/upload.js'; // Import multer upload middleware
import authMiddleware from '../middleware/authMiddleware.js'; // Import auth middleware (for protected routes later)

const router = express.Router();

// Register route:
// Use upload.single('profilePicture') directly as middleware.
// Multer will parse the 'multipart/form-data' and populate req.body (for text fields)
// and req.file (for the uploaded file).
// Any Multer-specific errors (like file size limits) will be handled by Multer itself
// or can be caught by a general Express error handling middleware if you set one up.
router.post('/register',
  upload.single('profilePicture'), // Multer middleware to handle file upload
  signup // The signup controller
);

// Login route
router.post('/login', login);

// Example of a protected route (requires JWT)
// router.get('/profile', authMiddleware, (req, res) => {
//   res.json({ message: `Welcome, user ${req.userId}! This is a protected route.` });
// });

export default router;
