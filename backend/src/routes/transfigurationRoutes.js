import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data'; // Only needed if you need to inspect/modify formData

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/transfigure', upload.single('image'), async (req, res) => {
    try {
        const spell = req.body.spell;

        // Recreate FormData to send to Flask AI
        const formData = new FormData();
        formData.append('image', req.file.buffer, {
            filename: req.file.originalname || 'image.jpg', // Use original filename if available
            contentType: req.file.mimetype // Use original mime type
        });
        formData.append('spell', spell);

        // Forward the request to Flask AI endpoint
        const response = await axios.post(
            'http://localhost:5001/ai/transform_image', // Flask AI endpoint
            formData,
            {
                headers: {
                    ...formData.getHeaders(), // Important: include FormData headers for multipart
                },
                responseType: 'arraybuffer', // Ensure we receive raw image bytes
            }
        );

        // Forward Flask AI's response directly to the client
        // Set the appropriate content type based on the Flask response or the spell
        // For Evanesco, Flask might return image/png, otherwise image/jpeg
        // You might need to get Content-Type header from Flask response if it's dynamic
        const contentType = response.headers['content-type'] || 'image/jpeg'; // Fallback to jpeg

        res.writeHead(response.status, {
            'Content-Type': contentType,
            'Content-Length': response.data.length
        });
        res.end(Buffer.from(response.data, 'binary'));

    } catch (err) {
        console.error('Transfiguration error:', err.message);
        // Log full error if available, especially response data from Flask
        if (err.response) {
            console.error('Flask AI Response Error Status:', err.response.status);
            console.error('Flask AI Response Error Data:', err.response.data ? Buffer.from(err.response.data).toString('utf8') : 'No data');
        }
        res.status(500).json({ error: 'Failed to transfigure image' });
    }
});

export default router;