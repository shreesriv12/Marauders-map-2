import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/transfigure', upload.single('image'), async (req, res) => {
  try {
    const spell = req.body.spell;

    const formData = new FormData();
    formData.append('image', req.file.buffer, 'image.jpg');
    formData.append('spell', spell);

    const response = await axios.post(
      'http://localhost:5001/ai/transform_image', // Flask AI endpoint
      formData,
      {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer', // ensures we receive raw image bytes
      }
    );

    const transformed = Buffer.from(response.data, 'binary').toString('base64');
    const original = req.file.buffer.toString('base64');

    res.json({
      originalImageUrl: `data:image/jpeg;base64,${original}`,
      transformedImageUrl: `data:image/jpeg;base64,${transformed}`,
    });
  } catch (err) {
    console.error('Transfiguration error:', err.message);
    res.status(500).json({ error: 'Failed to transfigure image' });
  }
});

export default router;
