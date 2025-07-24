import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Ensure this path is correct

const authMiddleware = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // console.log('AuthMiddleware: Received token:', token); // For debugging

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log('AuthMiddleware: Decoded token payload:', decoded); // For debugging

            // --- CRITICAL CORRECTION: Use decoded.id as per your JWT payload ---
            const user = await User.findById(decoded.id).select('-password');

            // console.log('AuthMiddleware: User found from DB:', user ? user._id : 'None'); // For debugging

            if (!user) {
                console.warn('AuthMiddleware: User not found for ID:', decoded.id);
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user; // Attach the full Mongoose user object to req.user
            // console.log('AuthMiddleware: req.user set with _id:', req.user._id); // For debugging

            next(); // Proceed to the next middleware/controller
        } catch (error) {
            console.error('AuthMiddleware: Token verification or DB error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed or invalid' });
        }
    } else {
        console.warn('AuthMiddleware: No authorization header or not a Bearer token.');
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

export default authMiddleware;