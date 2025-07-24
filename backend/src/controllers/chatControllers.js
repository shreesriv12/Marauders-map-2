import Chat from '../models/Chats.js'; // Path to your Chat model
import User from '../models/User.js'; // Path to your User model

/**
 * @desc Create a new chat (individual or group)
 * @route POST /api/chats
 * @access Private
 */
export const createChat = async (req, res) => {
    try {
        const { participants, type, name } = req.body; // participants should be an array of user IDs
        const currentUserId = req.user._id; // <-- Changed from req.user.id to req.user._id

        // Ensure the current user is always a participant
        if (!participants.includes(currentUserId.toString())) { // Convert to string for comparison if needed
            participants.push(currentUserId);
        }

        if (type === 'individual') {
            if (participants.length !== 2) {
                return res.status(400).json({ message: "Individual chats must have exactly two participants." });
            }

            // Check if a chat between these two participants already exists
            // Using $all to ensure both participants are present, and $size to ensure only two
            const existingChat = await Chat.findOne({
                participants: { $all: participants, $size: 2 },
                type: 'individual'
            });

            if (existingChat) {
                return res.status(200).json({ message: "Chat already exists.", chat: existingChat });
            }

            // Create new individual chat
            const newChat = await Chat.create({
                participants,
                type: 'individual'
            });

            // Populate participants before sending response
            const populatedChat = await Chat.findById(newChat._id)
                .populate('participants', 'username fullName avatarUrl'); // Select fields to populate

            return res.status(201).json({ message: "Individual chat created successfully.", chat: populatedChat });

        } else if (type === 'group') {
            if (!name || name.trim() === '') {
                return res.status(400).json({ message: "Group chats require a name." });
            }
            if (participants.length < 2) { // A group chat should have at least 2 participants besides the creator
                return res.status(400).json({ message: "Group chats must have at least two participants (excluding the creator, who is automatically added)." });
            }

            // Create new group chat
            const newChat = await Chat.create({
                participants,
                type: 'group',
                name
            });

            // Populate participants before sending response
            const populatedChat = await Chat.findById(newChat._id)
                .populate('participants', 'username fullName avatarUrl');

            return res.status(201).json({ message: "Group chat created successfully.", chat: populatedChat });

        } else {
            return res.status(400).json({ message: "Invalid chat type. Must be 'individual' or 'group'." });
        }

    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ message: "Failed to create chat.", error: error.message });
    }
};

/**
 * @desc Send a message to a chat
 * @route POST /api/chats/:chatId/messages
 * @access Private
 */
export const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const senderId = req.user._id; // <-- Changed from req.user.id to req.user._id

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: "Message content cannot be empty." });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found." });
        }

        // Ensure the sender is a participant of the chat
        if (!chat.participants.includes(senderId)) {
            return res.status(403).json({ message: "You are not a participant of this chat." });
        }

        const newMessage = {
            sender: senderId,
            content: content,
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = {
            sender: senderId,
            content: content,
            timestamp: newMessage.timestamp
        };

        await chat.save();

        // Populate sender details for the new message before sending response
        const populatedMessage = {
            ...newMessage,
            sender: await User.findById(senderId, 'username fullName avatarUrl') // Populate sender details
        };

        res.status(201).json({ message: "Message sent successfully.", message: populatedMessage });

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send message.", error: error.message });
    }
};

/**
 * @desc Get messages for a specific chat
 * @route GET /api/chats/:chatId/messages
 * @access Private
 */
export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const currentUserId = req.user._id; // <-- Changed from req.user.id to req.user._id

        const chat = await Chat.findById(chatId)
            .populate('messages.sender', 'username fullName avatarUrl') // Populate sender for each message
            .select('messages participants'); // Select only messages and participants to reduce data transfer

        if (!chat) {
            return res.status(404).json({ message: "Chat not found." });
        }

        // Ensure the current user is a participant of the chat
        if (!chat.participants.includes(currentUserId)) {
            return res.status(403).json({ message: "You are not authorized to view this chat." });
        }

        res.status(200).json({ messages: chat.messages });

    } catch (error) {
        console.error("Error fetching chat messages:", error);
        res.status(500).json({ message: "Failed to fetch chat messages.", error: error.message });
    }
};

/**
 * @desc Get all chats for the authenticated user
 * @route GET /api/chats
 * @access Private
 */
export const getUserChats = async (req, res) => {
    try {
        const currentUserId = req.user._id; // <-- Changed from req.user.id to req.user._id

        const chats = await Chat.find({ participants: currentUserId })
            .populate('participants', 'username fullName avatarUrl') // Populate all participants
            .populate('lastMessage.sender', 'username fullName avatarUrl') // Populate sender of the last message
            .sort({ 'lastMessage.timestamp': -1, 'updatedAt': -1 }); // Sort by last message timestamp or chat update time

        res.status(200).json({ chats });

    } catch (error) {
        console.error("Error fetching user chats:", error);
        res.status(500).json({ message: "Failed to fetch user chats.", error: error.message });
    }
};

/**
 * @desc Get details of a specific chat
 * @route GET /api/chats/:chatId
 * @access Private
 */
export const getChatDetails = async (req, res) => {
    try {
        const { chatId } = req.params;
        const currentUserId = req.user._id; // <-- Changed from req.user.id to req.user._id

        const chat = await Chat.findById(chatId)
            .populate('participants', 'username fullName avatarUrl') // Populate all participants
            .populate('lastMessage.sender', 'username fullName avatarUrl'); // Populate sender of the last message

        if (!chat) {
            return res.status(404).json({ message: "Chat not found." });
        }

        // Ensure the current user is a participant of the chat
        if (!chat.participants.includes(currentUserId)) {
            return res.status(403).json({ message: "You are not authorized to view this chat." });
        }

        res.status(200).json({ chat });

    } catch (error) {
        console.error("Error fetching chat details:", error);
        res.status(500).json({ message: "Failed to fetch chat details.", error: error.message });
    }
};