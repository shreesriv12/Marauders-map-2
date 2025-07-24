import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken'; // Needed for Socket.IO authentication

// Import your existing models
import User from './src/models/User.js'; // Your User model
import Message from './src/models/Chats.js'; // CORRECTED: Import your Message model

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server on the same HTTP server
const io = new SocketIOServer(server, {
    cors: {
        origin: "*", // Allow all origins for development. In production, specify your frontend URL.
        methods: ["GET", "POST"]
    }
});

// --- In-Memory Storage for Online Status and Marauder's Map ---
// This map will store logged-in users and their primary socket IDs for chat.
// Key: userId (string), Value: socketId (string)
const onlineChatUsers = new Map();

// This map will store Marauder's Map specific data.
// Key: userId (string), Value: { latitude, longitude, lastUpdate, isTrackingActive, socketId, name }
const maraudersMapUsers = {}; // Renamed for clarity from activeUsers


// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- CORRECTED: Import your existing routes here ---
import authRoutes from './src/routes/authRoutes.js';
import newsRoutes from './src/routes/newsRoutes.js';
import transfigurationRoutes from './src/routes/transfigurationRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js'; // Import your chat routes

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api', transfigurationRoutes);
app.use('/api/chats', chatRoutes); // Use your chat routes here

// Basic test route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hogwarts Backend is running!' });
});

// --- Socket.IO Authentication Middleware ---
io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // Client must send token in handshake.auth.token
    if (!token) {
        console.warn('Socket.IO Auth: No token provided');
        return next(new Error('Authentication error: No token provided.'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // --- CRITICAL CORRECTION: Use decoded.id as per your JWT payload ---
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            console.warn('Socket.IO Auth: User not found for ID:', decoded.id);
            return next(new Error('Authentication error: User not found.'));
        }

        // Attach the authenticated user object to the socket for easy access in subsequent handlers
        socket.user = user;
        next(); // Allow the connection
    } catch (error) {
        console.error('Socket.IO Auth: Token verification error:', error.message);
        next(new Error('Authentication error: Invalid token.'));
    }
});


// --- Socket.IO Connection Handler ---
io.on('connection', (socket) => {
    // At this point, socket.user is guaranteed to be available and valid due to the middleware
    const userId = socket.user._id.toString();
    const username = socket.user.username;
    console.log(`[Connect] User connected: ${socket.id} (User ID: ${userId}, Username: ${username})`);

    // --- CHAT SYSTEM LOGIC ---
    // Add user to online chat users map
    // For simplicity, assuming one active chat session per user (last one wins).
    onlineChatUsers.set(userId, socket.id);

    // Broadcast the updated list of online chat users to all clients
    io.emit('online_users_update', Array.from(onlineChatUsers.keys()));
    console.log("Online chat users:", Array.from(onlineChatUsers.keys()));

    // Event for sending a private message
    socket.on('send_message', async ({ receiverId, content }) => {
        try {
            if (!receiverId || !content || content.trim() === '') {
                return socket.emit('message_error', 'Receiver ID and message content are required.');
            }
            if (!mongoose.Types.ObjectId.isValid(receiverId)) {
                return socket.emit('message_error', 'Invalid receiver ID format.');
            }

            const senderId = socket.user._id;

            // Save message to database using the Message model
            const message = await Message.create({
                sender: senderId,
                receiver: receiverId,
                content: content.trim(),
            });

            // Populate sender details for real-time broadcast
            // This ensures the frontend gets full user objects, just like fetched past messages
            const populatedMessage = await message.populate('sender', 'username avatarUrl fullName');

            // Emit message to the receiver if they are online
            const receiverSocketId = onlineChatUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', populatedMessage);
                console.log(`[Chat] Message from ${username} to ${receiverId} broadcasted to receiver.`);
            }

            // Also emit to the sender's own client to update their chat window instantly
            io.to(socket.id).emit('receive_message', populatedMessage);
            console.log(`[Chat] Message from ${username} to ${receiverId} broadcasted to sender.`);

        } catch (error) {
            console.error("[Chat] Error sending message:", error);
            socket.emit('message_error', 'Failed to send message.');
        }
    });

    // Event for fetching past messages between two users (handled by REST endpoint now, but keeping this for reference)
    // You might remove this if the REST API is the primary way to get history.
    socket.on('fetch_messages', async ({ otherUserId }) => {
        try {
            if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
                return socket.emit('message_error', 'Invalid other user ID for fetching messages.');
            }

            const currentUserId = socket.user._id;
            const messages = await Message.find({
                $or: [
                    { sender: currentUserId, receiver: otherUserId },
                    { sender: otherUserId, receiver: currentUserId }
                ]
            })
            .sort('createdAt')
            .populate('sender', 'username avatarUrl fullName')
            .populate('receiver', 'username avatarUrl fullName');

            socket.emit('past_messages', messages);
            console.log(`[Chat] Fetched ${messages.length} past messages for ${username} with ${otherUserId}.`);
        } catch (error) {
            console.error("[Chat] Error fetching past messages:", error);
            socket.emit('message_error', 'Failed to fetch past messages.');
        }
    });

    // --- MARAUDER'S MAP SPECIFIC LOGIC (Updated to use socket.user) ---

    // Initialize user in maraudersMapUsers if not present
    if (!maraudersMapUsers[userId]) {
        maraudersMapUsers[userId] = {
            socketId: socket.id,
            latitude: null,
            longitude: null,
            lastUpdate: Date.now(),
            isTrackingActive: false, // Default to not tracking for Marauder's Map
            name: username // Use username from authenticated user
        };
    } else {
        maraudersMapUsers[userId].socketId = socket.id; // Update socket ID if user reconnects
        maraudersMapUsers[userId].name = username; // Ensure name is up-to-date
    }

    // Send the current map activation status to the newly connected user
    io.to(socket.id).emit('mapActivationStatus', maraudersMapUsers[userId].isTrackingActive);
    console.log(`[Marauder's Map] Sent mapActivationStatus (${maraudersMapUsers[userId].isTrackingActive}) to ${username}`);

    // If the map is already active for this user, send them the current active users
    if (maraudersMapUsers[userId].isTrackingActive) {
        const usersToSend = {};
        for (const id in maraudersMapUsers) {
            if (maraudersMapUsers[id].isTrackingActive && maraudersMapUsers[id].latitude !== null && maraudersMapUsers[id].longitude !== null) {
                usersToSend[id] = {
                    userId: id,
                    latitude: maraudersMapUsers[id].latitude,
                    longitude: maraudersMapUsers[id].longitude,
                    name: maraudersMapUsers[id].name
                };
            }
        }
        io.to(socket.id).emit('activeUsers', usersToSend);
        console.log(`[Marauder's Map] Sent initial activeUsers to ${username}`);
    }


    // Event listener for location updates from clients (Marauder's Map)
    // Frontend sends: { latitude, longitude } (userId derived from socket.user)
    socket.on('sendLocation', (data) => {
        console.log(`[Marauder's Map] Received location from ${username} (Socket: ${socket.id}): Lat ${data.latitude}, Lng ${data.longitude}`);

        if (maraudersMapUsers[userId]) {
            maraudersMapUsers[userId].latitude = data.latitude;
            maraudersMapUsers[userId].longitude = data.longitude;
            maraudersMapUsers[userId].lastUpdate = Date.now();

            if (maraudersMapUsers[userId].isTrackingActive) {
                socket.broadcast.emit('locationUpdate', {
                    userId: userId,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    name: username
                });
                console.log(`[Marauder's Map] Broadcasting location update for ${username}`);
            } else {
                console.log(`[Marauder's Map] User ${username} is not active, not broadcasting location.`);
            }
        }
    });

    // Event listener for map activation spell (Marauder's Map)
    socket.on('activateMap', () => { // No need for userId in data, it's from socket.user
        if (maraudersMapUsers[userId]) {
            maraudersMapUsers[userId].isTrackingActive = true;
            console.log(`[Marauder's Map] User ${username} activated the Marauder's Map.`);

            io.to(socket.id).emit('mapActivationStatus', true);

            const usersToSend = {};
            for (const id in maraudersMapUsers) {
                if (maraudersMapUsers[id].isTrackingActive && maraudersMapUsers[id].latitude !== null && maraudersMapUsers[id].longitude !== null) {
                    usersToSend[id] = {
                        userId: id,
                        latitude: maraudersMapUsers[id].latitude,
                        longitude: maraudersMapUsers[id].longitude,
                        name: maraudersMapUsers[id].name
                    };
                }
            }
            io.to(socket.id).emit('activeUsers', usersToSend);
            console.log(`[Marauder's Map] Sent initial activeUsers to ${username}`);

            if (maraudersMapUsers[userId].latitude !== null && maraudersMapUsers[userId].longitude !== null) {
                socket.broadcast.emit('locationUpdate', {
                    userId: userId,
                    latitude: maraudersMapUsers[userId].latitude,
                    longitude: maraudersMapUsers[userId].longitude,
                    name: username
                });
                console.log(`[Marauder's Map] Broadcasting initial location for newly active user ${username}`);
            }
        }
    });

    // Event listener for "Mischief Managed" (deactivation) (Marauder's Map)
    socket.on('deactivateMap', () => { // No need for userId in data
        if (maraudersMapUsers[userId]) {
            maraudersMapUsers[userId].isTrackingActive = false;
            console.log(`[Marauder's Map] User ${username} deactivated the Marauder's Map.`);
            io.to(socket.id).emit('mapActivationStatus', false);
            socket.broadcast.emit('userLeft', { userId: userId });
            console.log(`[Marauder's Map] Broadcasted userLeft for ${username}`);
        }
    });

    // Event listener for requesting active users (e.g., when map becomes active) (Marauder's Map)
    socket.on('requestActiveUsers', () => { // No need for userId in data
        console.log(`[Marauder's Map] Socket ${socket.id} (User ID: ${username}) requested active users.`);
        const usersToSend = {};
        for (const id in maraudersMapUsers) {
            if (maraudersMapUsers[id].isTrackingActive && maraudersMapUsers[id].latitude !== null && maraudersMapUsers[id].longitude !== null) {
                usersToSend[id] = {
                    userId: id,
                    latitude: maraudersMapUsers[id].latitude,
                    longitude: maraudersMapUsers[id].longitude,
                    name: maraudersMapUsers[id].name
                };
            }
        }
        io.to(socket.id).emit('activeUsers', usersToSend);
        console.log(`[Marauder's Map] Sent active users to Socket ${socket.id}`);
    });

    // --- End Marauder's Map Specific Socket.IO Events ---


    // --- Existing News Feed Socket.IO Events (Unchanged, no direct user ID dependency) ---
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
        } else {
            console.warn(`Invalid category received from ${socket.id}: ${category}`);
        }
    });
    // --- End Existing News Feed Socket.IO Events ---

    // --- Disconnect Handler (Combined) ---
    socket.on('disconnect', () => {
        const disconnectedUserId = socket.user._id.toString(); // Get user ID before it's gone
        const disconnectedUsername = socket.user.username;
        console.log(`[Disconnect] User disconnected: ${socket.id} (User ID: ${disconnectedUserId}, Username: ${disconnectedUsername})`);

        // Clean up CHAT SYSTEM data
        onlineChatUsers.delete(disconnectedUserId);
        io.emit('online_users_update', Array.from(onlineChatUsers.keys()));
        console.log("Online chat users after disconnect:", Array.from(onlineChatUsers.keys()));


        // Clean up MARAUDER'S MAP specific data
        if (maraudersMapUsers[disconnectedUserId]) {
            io.emit('userLeft', { userId: disconnectedUserId }); // Broadcast to all map users
            console.log(`[Disconnect] Broadcasted userLeft for ${disconnectedUsername} (Marauder's Map).`);
            delete maraudersMapUsers[disconnectedUserId]; // Remove from activeUsers list
            console.log(`[Disconnect] User ${disconnectedUsername} removed from maraudersMapUsers.`);
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

// Export `io` and `app` for potential use in other modules (e.g., if you need to emit from a REST endpoint)
export { io };
export default app;