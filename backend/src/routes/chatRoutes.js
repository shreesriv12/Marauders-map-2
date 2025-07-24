import express from 'express';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/authMiddleware.js'; // Your existing auth middleware
import Message from '../models/Chats.js'; // Correctly import the Message model
import User from '../models/User.js'; // Import your User model to populate details

const router = express.Router();

/**
 * @desc Get messages between the authenticated user and another specific user
 * @route GET /api/chats/:otherUserId/messages
 * @access Private
 */
router.get('/:otherUserId/messages', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // The ID of the currently logged-in user (from authMiddleware)
        const otherUserId = req.params.otherUserId;

        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            return res.status(400).json({ message: 'Invalid other user ID format.' });
        }

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        })
        .sort('createdAt') // Sort by creation timestamp to get messages in chronological order
        .populate('sender', 'username avatarUrl fullName') // Populate sender details
        .populate('receiver', 'username avatarUrl fullName'); // Populate receiver details (optional, but good for completeness)

        res.status(200).json(messages);

    } catch (error) {
        console.error('Error fetching chat messages (GET /api/chats/:otherUserId/messages):', error);
        res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
});

/**
 * @desc Get a list of distinct conversations (users the current user has messaged)
 * This creates a "chat list" for the frontend.
 * @route GET /api/chats
 * @access Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Find all unique users the current user has communicated with
        const conversationPartners = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: currentUserId },
                        { receiver: currentUserId }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ['$sender', currentUserId] },
                            then: '$receiver',
                            else: '$sender'
                        }
                    },
                    // Get the last message content and timestamp for display
                    lastMessageContent: { $last: '$content' },
                    lastMessageCreatedAt: { $last: '$createdAt' },
                    lastMessageSender: { $last: '$sender' } // To populate sender of last message
                }
            },
            {
                $lookup: {
                    from: 'users', // Name of your users collection (usually lowercase and plural)
                    localField: '_id', // The _id here is the other user's ID
                    foreignField: '_id',
                    as: 'otherUser'
                }
            },
            {
                $unwind: '$otherUser' // Unwind the array created by $lookup
            },
            {
                $lookup: {
                    from: 'users', // To populate the sender of the last message
                    localField: 'lastMessageSender',
                    foreignField: '_id',
                    as: 'lastMessageSenderDetails'
                }
            },
            {
                $unwind: {
                    path: '$lastMessageSenderDetails',
                    preserveNullAndEmptyArrays: true // Important for cases where lastMessageSender might be null
                }
            },
            {
                $project: {
                    _id: '$otherUser._id', // Use the other user's ID as the chat ID for frontend
                    otherUser: {
                        _id: '$otherUser._id',
                        username: '$otherUser.username',
                        fullName: '$otherUser.fullName',
                        avatarUrl: '$otherUser.avatarUrl'
                    },
                    lastMessage: {
                        content: '$lastMessageContent',
                        timestamp: '$lastMessageCreatedAt',
                        sender: {
                            _id: '$lastMessageSenderDetails._id',
                            username: '$lastMessageSenderDetails.username',
                            fullName: '$lastMessageSenderDetails.fullName'
                        }
                    }
                }
            },
            {
                $sort: { 'lastMessage.timestamp': -1 } // Sort by the latest message in each conversation
            }
        ]);

        res.status(200).json(conversationPartners);

    } catch (error) {
        console.error("Error fetching user conversations (GET /api/chats):", error);
        res.status(500).json({ message: "Failed to fetch conversations.", error: error.message });
    }
});


export default router;