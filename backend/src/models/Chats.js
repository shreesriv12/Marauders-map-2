import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to your User model
        required: true
    },
    receiver: { // For direct private messages
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to your User model
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    // You could add 'readBy' array of user IDs for read receipts if desired later
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

export default mongoose.model('Message', messageSchema);