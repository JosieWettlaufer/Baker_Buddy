const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ message: "Unauthorized access" });

    try {
        const decoded = jwt.verify(token, "your_super_secret_key");
        req.user = decoded; //assigns decoded user id to req to use in future methods
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = protect;