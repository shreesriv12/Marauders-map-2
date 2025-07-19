import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; // Import the cors middleware
import authRoutes from './src/routes/authRoutes.js'; // Path to your auth routes

dotenv.config(); // Load environment variables from .env file

const app = express();

// --- Middleware ---

// Enable CORS: Allows your frontend (e.g., on localhost:5173) to make requests to this backend.
// For development, app.use(cors()) is fine.
// For production, configure specific origins for better security:
// app.use(cors({
//   origin: 'http://localhost:5173', // Replace with your actual frontend domain
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(cors());

// Body Parser: Parses incoming JSON requests.
// When dealing with file uploads (multipart/form-data), express.json() is NOT enough.
// Multer will handle the body parsing for file uploads.
// However, keep this for other JSON requests if you have them.
// Set limit to '50mb' to handle large JSON payloads, though for file uploads, Multer handles the size.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For URL-encoded data


// --- Routes ---
// All routes defined in authRoutes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hogwarts Backend is running!' });
});


// --- Database Connection & Server Start ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
