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
  //Gets user info from request body
  const { username, email, password } = req.body;

  console.log("Registration request received:", { username, email });

  // Check if all required fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if a user with the same username or email already exists
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });
    }

    // Hash the password before storing it in the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user in the database with an empty pages array
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      pages: [], // Initialize with an empty pages array
    });

    console.log("User registered successfully:", user._id);

    // Send success response after user is registered
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login user and return JWT token
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
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
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Send the token and user details in the response
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};



const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: `Welcome, user ${req.user.id}`,
      pages: user.pages, // Include all the user's pages with their timers
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



//RECIPE PAGES
const addRecipePage = async (req, res) => {
  try {
    const { label } = req.body;

    if (!label) {
      return res
        .status(400)
        .json({ message: "Please provide a label for the recipe page" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPage = {
      label,
      timers: [],
      unitConverters: [],
    };

    user.pages.push(newPage);
    await user.save();

    res.json({
      message: "Recipe page added successfully",
      page: newPage,
      pages: user.pages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Exporting the register and login functions so they can be used in other parts of the application
module.exports = {
  registerUser,
  loginUser,
  getUser,
  addRecipePage,
};
