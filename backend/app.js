import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import Routes
import authRoutes from './src/routes/authRoutes.js';
import newsRoutes from './src/routes/newsRoutes.js'; // This will also be modified

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// --- NO REDIS CLIENT INITIALIZATION HERE ANYMORE ---


// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);


// Basic test route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hogwarts Backend is running!' });
});

// --- Socket.IO Connection Handler ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    socket.on('joinNewsFeed', (category) => {
        if (typeof category === 'string' && category.length > 0) {
            socket.join(category);
            console.log(`${socket.id} joined news feed for category: ${category}`);
        } else {
            console.warn(`Invalid category received from ${socket.id}: ${category}`);
        }
    });

    socket.on('leaveNewsFeed', (category) => {
        if (typeof category === 'string' && category.length > 0) {
            socket.leave(category);
            console.log(`${socket.id} left news feed for category: ${category}`);
        }
    });
});


// --- Database Connection & Server Start ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error('MongoDB connection error:', err));

// Export `io` ONLY now, as redisClient is removed
export { io };
export default app;