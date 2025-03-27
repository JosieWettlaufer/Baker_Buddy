// Importing the User model to interact with the database
const User = require("../models/User");
// Importing JWT for authentication and token generation
const jwt = require("jsonwebtoken");
// Importing bcrypt for hashing passwords
const bcrypt = require("bcryptjs");
// Load environment variables from .env file
require("dotenv").config();

// Register a new user
const registerUser = async (req, res) => {
  // Extracts user info (username and password) from the request body
  const { username, password } = req.body;

  console.log("Registration request received:", { username });

  // Check if both the username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if a user with the same username already exists
    const userExists = await User.findOne({ username }).select("_id"); // Returns only the _id field (not the entire document)
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Username already exists" }); // Respond if the username is already taken
    }

    // Hash the password before storing it in the database for security
    const salt = await bcrypt.genSalt(10); // Generates salt for hashing
    const hashedPassword = await bcrypt.hash(password, salt); // Hashes the password

    // Create and save the new user in the database with an empty pages array
    const user = await User.create({
      username,
      password: hashedPassword, // Store the hashed password
      pages: [], // Initialize with an empty pages array for the user
    });

    console.log("User registered successfully:", user._id); // Log the newly registered user's ID

    // Respond with success message and the registered user details
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Registration error:", error); // Log any errors
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login user and return JWT token
const loginUser = async (req, res) => {
  const { username, password } = req.body; // Get user credentials from the request body

  try {
    // Find the user by username in the database
    const user = await User.findOne({ username });

    // Check if the user exists and if the provided password matches the stored hashed password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" }); // Invalid login credentials
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign(
      {
        id: user._id, // User's ID in the token
        userId: user._id, // Additional user ID field
      },
      process.env.JWT_SECRET, // Secret key for JWT signing, stored in .env file
      { expiresIn: "1h" } // Set token expiration to 1 hour
    );

    // Send the JWT token and user details in the response
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error); // Log any errors
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// Fetch user details and include their pages
const getUser = async (req, res) => {
  try {
    // Find the user by ID from the JWT token
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" }); // Return error if user not found

    // Respond with the user's details and their associated pages
    res.json({
      message: `Welcome, user ${req.user.id}`,
      pages: user.pages, // Include the user's pages (with timers and converters)
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add a new recipe page for the user
const addRecipePage = async (req, res) => {
  try {
    const { label } = req.body; // Get recipe label from the request body

    // Ensure the label is provided
    if (!label) {
      return res
        .status(400)
        .json({ message: "Please provide a label for the recipe page" });
    }

    // Find the user by ID from the JWT token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new page with an empty timers and unitConverters array
    const newPage = {
      label,
      timers: [], // Initialize with no timers
      unitConverters: [], // Initialize with no unit converters
    };

    // Push the new page to the user's pages array
    user.pages.push(newPage);
    await user.save(); // Save the updated user

    // Respond with success message and updated pages list
    res.json({
      message: "Recipe page added successfully",
      page: newPage,
      pages: user.pages,
    });
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).json({ message: "Server error", error });
  }
};

// Exporting the functions for use in other parts of the application
module.exports = {
  registerUser,
  loginUser,
  getUser,
  addRecipePage,
};
