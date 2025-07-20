// your-project-root/backend-nodejs/src/models/NewsArticle.js
import mongoose from 'mongoose';

const NewsArticleSchema = new mongoose.Schema({
    headline: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Ministry Affairs', 'Dark Arts', 'Quidditch', 'Creatures', 'General'], // Define allowed categories
    },
    imageURL: {
        type: String,
        default: 'https://placehold.co/640x480/333333/FFFFFF?text=Daily+Prophet', // Default placeholder
    },
    author: {
        type: String,
        default: 'The Daily Prophet AI',
    },
    publishDate: {
        type: Date,
        default: Date.now,
    },
});

const NewsArticle = mongoose.model('NewsArticle', NewsArticleSchema);

export default NewsArticle;