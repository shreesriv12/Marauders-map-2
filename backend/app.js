import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

import User from './src/models/User.js';
import Message from './src/models/Chats.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// --- Global State for Marauder's Map ---
let isGlobalMapActive = false; // <<< NEW GLOBAL FLAG
// --- In-Memory Storage for Online Status and Marauder's Map ---
const onlineChatUsers = new Map();

// This map will store Marauder's Map specific data.
// Key: userId (string), Value: { latitude, longitude, lastUpdate, socketId, name }
// isTrackingActive is now controlled by isGlobalMapActive
const maraudersMapUsers = {};

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import authRoutes from './src/routes/authRoutes.js';
import newsRoutes from './src/routes/newsRoutes.js';
import transfigurationRoutes from './src/routes/transfigurationRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api', transfigurationRoutes);
app.use('/api/chats', chatRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hogwarts Backend is running!' });
});

// --- Socket.IO Authentication Middleware ---
io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        console.warn('Socket.IO Auth: No token provided');
        return next(new Error('Authentication error: No token provided.'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            console.warn('Socket.IO Auth: User not found for ID:', decoded.id);
            return next(new Error('Authentication error: User not found.'));
        }

        socket.user = user;
        next();
    } catch (error) {
        console.error('Socket.IO Auth: Token verification error:', error.message);
        next(new Error('Authentication error: Invalid token.'));
    }
});

// --- Socket.IO Connection Handler ---
io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    const username = socket.user.username;
    console.log(`[Connect] User connected: ${socket.id} (User ID: ${userId}, Username: ${username})`);

    // --- CHAT SYSTEM LOGIC ---
    onlineChatUsers.set(userId, socket.id);
    io.emit('online_users_update', Array.from(onlineChatUsers.keys()));
    console.log("Online chat users:", Array.from(onlineChatUsers.keys()));

    socket.on('send_message', async ({ receiverId, content }) => {
        try {
            if (!receiverId || !content || content.trim() === '') {
                return socket.emit('message_error', 'Receiver ID and message content are required.');
            }
            if (!mongoose.Types.ObjectId.isValid(receiverId)) {
                return socket.emit('message_error', 'Invalid receiver ID format.');
            }

            const senderId = socket.user._id;

            const message = await Message.create({
                sender: senderId,
                receiver: receiverId,
                content: content.trim(),
            });

            const populatedMessage = await message.populate('sender', 'username avatarUrl fullName');

            const receiverSocketId = onlineChatUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', populatedMessage);
                console.log(`[Chat] Message from ${username} to ${receiverId} broadcasted to receiver.`);
            }

            io.to(socket.id).emit('receive_message', populatedMessage);
            console.log(`[Chat] Message from ${username} to ${receiverId} broadcasted to sender.`);

        } catch (error) {
            console.error("[Chat] Error sending message:", error);
            socket.emit('message_error', 'Failed to send message.');
        }
    });

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

    // --- MARAUDER'S MAP SPECIFIC LOGIC (UPDATED) ---

    // Initialize user in maraudersMapUsers
    maraudersMapUsers[userId] = {
        ...maraudersMapUsers[userId], // Preserve existing location/lastUpdate if user reconnects
        socketId: socket.id,
        name: username
    };
    // No longer initializing isTrackingActive here, it's controlled by isGlobalMapActive

    // Send the GLOBAL map activation status to the newly connected user
    io.to(socket.id).emit('mapActivationStatus', isGlobalMapActive); // <<< send global status
    console.log(`[Marauder's Map] Sent mapActivationStatus (${isGlobalMapActive}) to ${username} on connect.`);

    // If the map is globally active, send existing active users to the connecting client
    if (isGlobalMapActive) {
        const usersToSend = {};
        for (const id in maraudersMapUsers) {
            if (maraudersMapUsers[id].latitude !== null && maraudersMapUsers[id].longitude !== null) { // Only send users with known locations
                usersToSend[id] = {
                    userId: id,
                    latitude: maraudersMapUsers[id].latitude,
                    longitude: maraudersMapUsers[id].longitude,
                    name: maraudersMapUsers[id].name
                };
            }
        }
        io.to(socket.id).emit('activeUsers', usersToSend);
        console.log(`[Marauder's Map] Sent initial activeUsers to ${username} because map is globally active.`);
    }

    // Event listener for location updates from clients
    socket.on('sendLocation', (data) => {
        console.log(`[Marauder's Map] Received location from ${username} (Socket: ${socket.id}): Lat ${data.latitude}, Lng ${data.longitude}`);

        if (maraudersMapUsers[userId]) {
            maraudersMapUsers[userId].latitude = data.latitude;
            maraudersMapUsers[userId].longitude = data.longitude;
            maraudersMapUsers[userId].lastUpdate = Date.now();

            // Only broadcast if the map is globally active
            if (isGlobalMapActive) { // <<< Use global flag
                socket.broadcast.emit('locationUpdate', {
                    userId: userId,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    name: username
                });
                console.log(`[Marauder's Map] Broadcasting location update for ${username}`);
            } else {
                console.log(`[Marauder's Map] Map is globally inactive, not broadcasting location for ${username}.`);
            }
        }
    });

    // Event listener for map activation spell
    socket.on('activateMap', () => {
        if (!isGlobalMapActive) { // Only activate if not already active
            isGlobalMapActive = true; // <<< Set global flag to true
            console.log(`[Marauder's Map] Map globally activated by ${username}.`);
            io.emit('mapActivationStatus', true); // <<< Broadcast to ALL clients
            console.log(`[Marauder's Map] Broadcasted mapActivationStatus (true) to all clients.`);
        } else {
            console.log(`[Marauder's Map] Map already globally active. Confirming status to ${username}.`);
            io.to(socket.id).emit('mapActivationStatus', true); // Confirm to sender
        }

        // Always send initial active users to the user who just activated/re-activated their view
        const usersToSend = {};
        for (const id in maraudersMapUsers) {
            // Only include users who have sent a location at least once
            if (maraudersMapUsers[id].latitude !== null && maraudersMapUsers[id].longitude !== null) {
                usersToSend[id] = {
                    userId: id,
                    latitude: maraudersMapUsers[id].latitude,
                    longitude: maraudersMapUsers[id].longitude,
                    name: maraudersMapUsers[id].name
                };
            }
        }
        io.to(socket.id).emit('activeUsers', usersToSend);
        console.log(`[Marauder's Map] Sent activeUsers to ${username} after activation.`);

        // If the activating user has a location, also broadcast their current location
        if (maraudersMapUsers[userId].latitude !== null && maraudersMapUsers[userId].longitude !== null) {
            socket.broadcast.emit('locationUpdate', {
                userId: userId,
                latitude: maraudersMapUsers[userId].latitude,
                longitude: maraudersMapUsers[userId].longitude,
                name: username
            });
            console.log(`[Marauder's Map] Broadcasting initial location for newly active user ${username} (after global activation).`);
        }
    });

    // Event listener for "Mischief Managed" (deactivation)
    socket.on('deactivateMap', () => {
        if (isGlobalMapActive) { // Only deactivate if currently active
            isGlobalMapActive = false; // <<< Set global flag to false
            console.log(`[Marauder's Map] Map globally deactivated by ${username}.`);
            io.emit('mapActivationStatus', false); // <<< Broadcast to ALL clients
            console.log(`[Marauder's Map] Broadcasted mapActivationStatus (false) to all clients.`);
        } else {
            console.log(`[Marauder's Map] Map already globally inactive. Confirming status to ${username}.`);
            io.to(socket.id).emit('mapActivationStatus', false); // Confirm to sender
        }
        // When the map deactivates, we don't necessarily need to immediately remove users from maraudersMapUsers,
        // as they might reactivate it later. But we do need to tell clients to clear their maps.
        // The 'mapActivationStatus: false' handles this on the client.
    });

    // Event listener for requesting active users (e.g., when map becomes active on frontend)
    socket.on('requestActiveUsers', () => {
        console.log(`[Marauder's Map] Socket ${socket.id} (User ID: ${username}) requested active users.`);
        const usersToSend = {};
        // Only send active users if the map is globally active
        if (isGlobalMapActive) { // <<< Use global flag here
            for (const id in maraudersMapUsers) {
                // Only send users who have sent a location and are not the requesting user (to avoid duplicate markers on own map)
                if (id !== userId && maraudersMapUsers[id].latitude !== null && maraudersMapUsers[id].longitude !== null) {
                    usersToSend[id] = {
                        userId: id,
                        latitude: maraudersMapUsers[id].latitude,
                        longitude: maraudersMapUsers[id].longitude,
                        name: maraudersMapUsers[id].name
                    };
                }
            }
        }
        io.to(socket.id).emit('activeUsers', usersToSend);
        console.log(`[Marauder's Map] Sent active users to Socket ${socket.id} (map globally active: ${isGlobalMapActive}).`);
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
        const disconnectedUserId = socket.user._id.toString();
        const disconnectedUsername = socket.user.username;
        console.log(`[Disconnect] User disconnected: ${socket.id} (User ID: ${disconnectedUserId}, Username: ${disconnectedUsername})`);

        // Clean up CHAT SYSTEM data
        onlineChatUsers.delete(disconnectedUserId);
        io.emit('online_users_update', Array.from(onlineChatUsers.keys()));
        console.log("Online chat users after disconnect:", Array.from(onlineChatUsers.keys()));

        // Clean up MARAUDER'S MAP specific data (remove their location, but don't deactivate map globally)
        if (maraudersMapUsers[disconnectedUserId]) {
            if (isGlobalMapActive) { // Only broadcast userLeft if the map is actually active
                io.emit('userLeft', { userId: disconnectedUserId }); // Broadcast to all map users
                console.log(`[Disconnect] Broadcasted userLeft for ${disconnectedUsername} (Marauder's Map).`);
            }
            // Important: Don't delete maraudersMapUsers[disconnectedUserId] entirely
            // just set their location to null and isTrackingActive to false
            // This preserves their entry if they log in again and allows them to quickly reactivate
            maraudersMapUsers[disconnectedUserId].latitude = null;
            maraudersMapUsers[disconnectedUserId].longitude = null;
            maraudersMapUsers[disconnectedUserId].socketId = null; // Clear socketId
            // maraudersMapUsers[disconnectedUserId].isTrackingActive = false; // No longer needed as it's global
            console.log(`[Disconnect] User ${disconnectedUsername}'s location cleared from maraudersMapUsers.`);
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

export { io };
export default app;