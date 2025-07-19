import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // Get token from header (Bearer TOKEN)
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user ID to the request object
    req.userId = decoded.id;
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ message: "Invalid token." });
  }
};

export default authMiddleware;
