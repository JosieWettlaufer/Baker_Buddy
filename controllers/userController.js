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
    const token = jwt.sign(
        {
             id: user._id,
             userId: user._id
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send the token and user details in the response
    res.json({ 
        token,
        user: { id: user._id, username: user.username, email: user.email }
    });
};

const addTimer = async(req, res) => {
    try {
        const { label, duration } = req.body;
    
        if (!label || !duration) {
          return res.status(400).json({ message: "Please provide both label and duration" });
        }
    
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        const newTimer = {
          label,
          duration,
          status: "active", // Default status is active
          createdAt: new Date(),
        };
    
        user.timers.push(newTimer);
        await user.save();
    
        res.json({
          message: "Timer added successfully",
          timers: user.timers, // Send back the updated timers list
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
      }
}

const getUser = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
    
        res.json({
          message: `Welcome, user ${req.user.id}`,
          timers: user.timers, // Include the user's timers
        });
      } catch (error) {
        res.status(500).json({ message: "Server error", error });
      }
}

const deleteTimer = async(req, res) => {
    const { timerId } = req.params; //get timer ID from URL

    const userId = req.userId;

    console.log("UserId in deleteTimer function:", userId);
    console.log("TimerId to delete:", timerId);


    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

        // Find the index of the timer to delete
        const timerIndex = user.timers.findIndex(timer => timer._id.toString() === timerId);

        if (timerIndex === -1) {
            return res.status(404).json({ message: 'Timer not found' });
        }

        // Remove the timer from the timers array
        user.timers.splice(timerIndex, 1);

        // Save the updated user document
        await user.save();

        //return updated list of timers
        res.status(200).json({ 
            message: "Timer deleted successfully",
            timers: user.timers });
    } catch (error) {
        console.error("Error deleting timer:", error);
        res.status(500).json({ message: "Server error, failed to delete timer" });
    }
};


// Exporting the register and login functions so they can be used in other parts of the application
module.exports = { registerUser, loginUser, addTimer, getUser, deleteTimer };
