import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import Routes
import authRoutes from './src/routes/authRoutes.js';
import newsRoutes from './src/routes/newsRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "*", // Allow all origins for development. In production, specify your frontend URL.
        methods: ["GET", "POST"]
    }
});

// --- Marauder's Map Specific In-Memory Storage and Constants ---
// In a production application, you would typically use a persistent database
// like MongoDB (which you already have set up) or Firebase Firestore for this data.
const activeUsers = {}; // Stores { userId: { latitude, longitude, lastUpdate, isTrackingActive, socketId } }
const ACTIVATION_SPELL = "i solemnly swear i am up to no good"; // Not used in this backend, but good for reference
// --- End Marauder's Map Specific ---

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

// --- Socket.IO Connection Handler (Combined for News Feed and Marauder's Map) ---
io.on('connection', (socket) => {
    console.log(`[Connect] A user connected: ${socket.id}`);
    let userId = null; // This userId will be set by the 'registerUser' event for Marauder's Map

    // --- Marauder's Map Specific Socket.IO Events ---

    // Event listener for client registering their user ID (Marauder's Map)
    socket.on('registerUser', (id) => {
        userId = id; // Set the userId for this specific socket connection
        console.log(`[RegisterUser] Socket ${socket.id} registered as User ID: ${userId}`);

        // Add user to activeUsers if not already present, or update socket ID
        if (!activeUsers[userId]) {
            activeUsers[userId] = {
                socketId: socket.id,
                latitude: null,
                longitude: null,
                lastUpdate: Date.now(),
                isTrackingActive: false // Default to not tracking for Marauder's Map
            };
        } else {
            activeUsers[userId].socketId = socket.id; // Update socket ID if user reconnects
        }

        // Send the current map activation status to the newly connected user
        io.to(activeUsers[userId].socketId).emit('mapActivationStatus', activeUsers[userId].isTrackingActive);

        // If the map is already active for this user, send them the current active users
        // This ensures they see others who are already active when they reconnect/register.
        if (activeUsers[userId].isTrackingActive) {
            const usersToSend = {};
            for (const id in activeUsers) {
                // Only send locations of users who are actively tracking and have valid coordinates
                if (activeUsers[id].isTrackingActive && activeUsers[id].latitude !== null && activeUsers[id].longitude !== null) {
                    usersToSend[id] = {
                        userId: id,
                        latitude: activeUsers[id].latitude,
                        longitude: activeUsers[id].longitude
                    };
                }
            }
            io.to(activeUsers[userId].socketId).emit('activeUsers', usersToSend);
            console.log(`[RegisterUser] Sent initial activeUsers to ${userId}`);
        }
    });

    // Event listener for location updates from clients (Marauder's Map)
    socket.on('sendLocation', (data) => {
        console.log(`[SendLocation] Received location from ${data.userId} (Socket: ${socket.id}): Lat ${data.latitude}, Lng ${data.longitude}`);

        // Ensure userId is set and the user exists in activeUsers
        if (userId && activeUsers[userId]) {
            // Always update user's location in memory
            activeUsers[userId].latitude = data.latitude;
            activeUsers[userId].longitude = data.longitude;
            activeUsers[userId].lastUpdate = Date.now();

            // Only broadcast the updated location to all other connected clients IF they are tracking
            if (activeUsers[userId].isTrackingActive) {
                socket.broadcast.emit('locationUpdate', {
                    userId: userId,
                    latitude: data.latitude,
                    longitude: data.longitude
                });
                console.log(`[SendLocation] Broadcasting location update for ${userId}`);
            } else {
                console.log(`[SendLocation] User ${userId} is not active, not broadcasting location.`);
            }
        } else {
            console.warn(`[SendLocation] Attempted to send location for unregistered or invalid userId: ${userId}`);
        }
    });

    // Event listener for map activation spell (Marauder's Map)
    socket.on('activateMap', (activatingUserId) => {
        if (activeUsers[activatingUserId]) {
            activeUsers[activatingUserId].isTrackingActive = true;
            console.log(`[ActivateMap] User ${activatingUserId} activated the Marauder's Map.`);
            // Emit status back to the activating user
            io.to(activeUsers[activatingUserId].socketId).emit('mapActivationStatus', true);

            // Send all currently active users' locations to the newly activated map
            const usersToSend = {};
            for (const id in activeUsers) {
                if (activeUsers[id].isTrackingActive && activeUsers[id].latitude !== null && activeUsers[id].longitude !== null) {
                    usersToSend[id] = {
                        userId: id,
                        latitude: activeUsers[id].latitude,
                        longitude: activeUsers[id].longitude
                    };
                }
            }
            io.to(activeUsers[activatingUserId].socketId).emit('activeUsers', usersToSend);
            console.log(`[ActivateMap] Sent initial activeUsers to ${activatingUserId}`);

            // If this user already has location data, broadcast it to others now that they're active
            if (activeUsers[activatingUserId].latitude !== null && activeUsers[activatingUserId].longitude !== null) {
                socket.broadcast.emit('locationUpdate', {
                    userId: activatingUserId,
                    latitude: activeUsers[activatingUserId].latitude,
                    longitude: activeUsers[activatingUserId].longitude
                });
                console.log(`[ActivateMap] Broadcasting initial location for newly active user ${activatingUserId}`);
            }
        }
    });

    // Event listener for "Mischief Managed" (deactivation) (Marauder's Map)
    socket.on('deactivateMap', (deactivatingUserId) => {
        if (activeUsers[deactivatingUserId]) {
            activeUsers[deactivatingUserId].isTrackingActive = false;
            console.log(`[DeactivateMap] User ${deactivatingUserId} deactivated the Marauder's Map.`);
            // Emit status back to the deactivating user
            io.to(activeUsers[deactivatingUserId].socketId).emit('mapActivationStatus', false);
            // Notify others that this user is no longer tracking
            socket.broadcast.emit('userDisconnected', deactivatingUserId);
            console.log(`[DeactivateMap] Broadcasted userDisconnected for ${deactivatingUserId}`);
        }
    });

    // Event listener for requesting active users (e.g., when map becomes active) (Marauder's Map)
    socket.on('requestActiveUsers', () => {
        console.log(`[RequestActiveUsers] Socket ${socket.id} (User ID: ${userId}) requested active users.`);
        const usersToSend = {};
        for (const id in activeUsers) {
            if (activeUsers[id].isTrackingActive && activeUsers[id].latitude !== null && activeUsers[id].longitude !== null) {
                usersToSend[id] = {
                    userId: id,
                    latitude: activeUsers[id].latitude,
                    longitude: activeUsers[id].longitude
                };
            }
        }
        socket.emit('activeUsers', usersToSend);
        console.log(`[RequestActiveUsers] Sent active users to Socket ${socket.id}`);
    });

    // --- End Marauder's Map Specific Socket.IO Events ---


    // --- Existing News Feed Socket.IO Events ---
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


    // --- Disconnect Handler (Combined for both features) ---
    socket.on('disconnect', () => {
        console.log(`[Disconnect] User disconnected: ${socket.id}`);
        // Clean up Marauder's Map specific data if this user was registered
        if (userId && activeUsers[userId]) {
            // Always notify others if a registered user disconnects, regardless of tracking status
            // The frontend can then decide if it needs to remove a marker for this ID
            io.emit('userDisconnected', userId);
            console.log(`[Disconnect] Broadcasted userDisconnected for ${userId}`);
            // Remove user from activeUsers list
            delete activeUsers[userId];
            console.log(`[Disconnect] User ${userId} removed from activeUsers.`);
        }
        // No specific cleanup needed for news feed rooms as socket.io handles leaving rooms on disconnect
    });
});


// --- Database Connection & Server Start ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        const PORT = process.env.PORT || 5000; // Your existing port
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error('MongoDB connection error:', err));

// Export `io` and `app`
export { io };
export default app;