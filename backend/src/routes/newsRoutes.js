// your-project-root/backend-nodejs/src/routes/newsRoutes.js
import express from 'express';
import axios from 'axios';
import NewsArticle from '../models/NewsArticle.js';
import { io } from '../../app.js'; // Import io

const router = express.Router();

// --- News Generation Route ---
router.post('/generate', async (req, res) => {
    const { category } = req.body;
    if (!category) {
        return res.status(400).json({ message: 'News category is required.' });
    }

    try {
        // --- Call Python Flask AI Service (Corrected Endpoint) ---
        console.log(`Calling Flask AI for news generation for category: ${category}`);
        // The URL is now FLASK_AI_URL/news-ai/generate-news
        const flaskResponse = await axios.post(`${process.env.FLASK_AI_URL}/news-ai/generate-news`, {
            category: category
        });

        const { news_content } = flaskResponse.data;

        // --- Important: Improve Parsing of Gemini Response ---
        const lines = news_content.split('\n');
        let headline = `Breaking News: ${category}`;
        let content = news_content;

        if (lines[0].startsWith('Headline:')) {
            headline = lines[0].replace('Headline:', '').trim();
            content = lines.slice(2).join('\n').trim();
        }

        // Generate a random image URL using loremflickr for variety
        const imageUrl = `https://loremflickr.com/640/480/${category.toLowerCase().replace(/\s/g, ',')},magic?random=${Date.now()}`;

        const newArticle = new NewsArticle({
            headline: headline,
            content: content,
            category: category,
            imageURL: imageUrl,
            author: 'The Daily Prophet AI',
            publishDate: new Date()
        });

        // Save to MongoDB
        await newArticle.save();
        console.log('New article saved to MongoDB:', newArticle.headline);

        // Emit Real-time Update via Socket.IO to clients joined in this category's room
        io.to(category).emit('newsUpdate', newArticle);
        console.log(`Emitted real-time news update for category: ${category}`);

        res.status(201).json(newArticle);

    } catch (error) {
        console.error('Error generating or processing news:', error.response ? error.response.data : error.message);
        res.status(500).json({
            message: 'Failed to generate news article.',
            error: error.response ? error.response.data : error.message
        });
    }
});

// --- Get All News Articles (No changes needed here as it already uses MongoDB directly) ---
router.get('/', async (req, res) => {
    try {
        const articles = await NewsArticle.find().sort({ publishDate: -1 }).limit(20);
        res.status(200).json(articles);
    } catch (error) {
        console.error('Error fetching news articles:', error.message);
        res.status(500).json({ message: 'Failed to fetch news articles.' });
    }
});

export default router;