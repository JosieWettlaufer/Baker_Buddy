const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware function to protect routes by verifying the user's JWT token.
 * Looks for a token in the cookies or the Authorization header.
 * If the token is valid, it sets the user data on the request object.
 * 
 * @param {Object} req - The request object, representing the HTTP request.
 * @param {Object} res - The response object, representing the HTTP response.
 * @param {Function} next - The next middleware function to pass control to.
 * @returns {void} Calls the next middleware if the token is valid, or sends an error response if invalid.
 */
const protect = (req, res, next) => {
  try {
    // Look for token in cookies or Authorization header
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided");
      return res
        .status(401)
        .json({ message: "Unauthorized access - No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_super_secret_key"
    );

    // Set user info from token
    req.user = decoded;
    req.userId = decoded.id; // Use decoded.id since that's what we set in the token

    console.log("Authentication successful for user:", req.userId);
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = protect;
