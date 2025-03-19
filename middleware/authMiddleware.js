const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ message: "Unauthorized access" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_super_secret_key");
        req.user = decoded; //assigns decoded user id to req to use in future methods

        // Set userId explicitly from the decoded token
        req.userId = decoded.id;  // Use decoded.id since that's what you set in the token
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = protect;