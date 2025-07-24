import express from 'express';
import multer from 'multer'; // Import multer for file uploads
import { signup, login, getMe, getAllUsers } from '../controllers/authController.js'; // Ensure getAllUsers is imported
import authMiddleware from '../middleware/authMiddleware.js'; // Your existing auth middleware

const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', upload.single('avatar'), signup); // 'avatar' is the field name for the file, consistent with authController
router.post('/login', login);

router.get('/me', authMiddleware, getMe); // Protected route to get current user profile
router.get('/users', authMiddleware, getAllUsers); // This is the missing route!

export default router;