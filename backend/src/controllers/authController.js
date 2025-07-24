import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Path to your User model
import { uploadToCloudinary } from '../middleware/upload.js'; // Path to your upload utility

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const signup = async (req, res) => {
  try {
    // Destructure fields from req.body (for text fields)
    // Multer places text fields in req.body and files in req.file
    const {
      fullName,
      username,
      email,
      password,
      house,
      dateOfBirth,
      favoriteSpell,
      wandCore,
      petCompanion
    } = req.body;

    // Basic server-side validation
    // CORRECTED: `!!password` should be `!password`
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "Please enter all required fields." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: "Email already exists. Please use a different one." });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username already exists. Please choose a different one." });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let avatarUrl = "";
    // Check if a file was uploaded by Multer
    if (req.file) {
      // Upload the image buffer to Cloudinary
      avatarUrl = await uploadToCloudinary(req.file.buffer);
    } else {
      // Use a default avatar if no file is uploaded
      avatarUrl = 'https://placehold.co/100x100/aabbcc/ffffff?text=User';
    }

    // Create new user in MongoDB
    const newUser = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
      house,
      avatarUrl, // Store the Cloudinary URL
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      favoriteSpell,
      wandCore,
      petCompanion
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Registration successful!",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        house: newUser.house,
        avatarUrl: newUser.avatarUrl,
        dateOfBirth: newUser.dateOfBirth,
        favoriteSpell: newUser.favoriteSpell,
        wandCore: newUser.wandCore,
        petCompanion: newUser.petCompanion,
      },
      token
    });
  } catch (err) {
    console.error("Signup failed:", err.message);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

/**
 * @desc Authenticate user & get token
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials (user not found)." });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials (incorrect password)." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        house: user.house,
        avatarUrl: user.avatarUrl,
        dateOfBirth: user.dateOfBirth,
        favoriteSpell: user.favoriteSpell,
        wandCore: user.wandCore,
        petCompanion: user.petCompanion,
      },
      token
    });
  } catch (err) {
    console.error("Login failed:", err.message);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

/**
 * @desc Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res) => {
    // req.user is populated by the authMiddleware
    res.json(req.user);
};

/**
 * @desc Get all users (for finding chat partners, etc.)
 * @route GET /api/auth/users
 * @access Private
 */
export const getAllUsers = async (req, res) => {
    try {
        // Exclude the current user from the list and remove password field
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};