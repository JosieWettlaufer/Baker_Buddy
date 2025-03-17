// Importing the User model to interact with the database
const User = require('../models/User');
// Importing JWT for authentication and token generation
const jwt = require('jsonwebtoken');
// Importing bcrypt for hashing passwords
const bcrypt = require('bcryptjs');
// Load environment variables from .env file
require("dotenv").config();


// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Check if all required fields are provided
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if a user with the same username or email already exists
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
        return res.status(400).json({ message: "Username or Email already exists" });
    }

    // Hash the password before storing it in the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create and save the new user in the database
    const user = await User.create({ username, email, password: hashedPassword });

    // Send success response after user is registered
    res.status(201).json({ message: "User registered successfully" });
};


// Login user and return JWT token
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Find user by username in the database
    const user = await User.findOne({ username });

    // Check if the user exists and if the provided password matches the hashed password
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign({ id: user._id }, "your_super_secret_key", {
        expiresIn: '1h' // Token expires in 1 hour
    });

    // Send the token and user details in the response
    res.json({ 
        token,
        user: { id: user._id, username: user.username, email: user.email }
    });
};



// Exporting the register and login functions so they can be used in other parts of the application
module.exports = { registerUser, loginUser };
