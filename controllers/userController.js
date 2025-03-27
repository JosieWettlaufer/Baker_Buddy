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

  console.log("Registration request received:", { username, email });

  // Check if all required fields are provided
  if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
  }

  try {
      // Check if a user with the same username or email already exists
      const userExists = await User.findOne({ $or: [{ username }, { email }] });
      if (userExists) {
          return res.status(400).json({ message: "Username or Email already exists" });
      }

      // Hash the password before storing it in the database
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create and save the new user in the database with an empty pages array
      const user = await User.create({ 
          username, 
          email, 
          password: hashedPassword,
          pages: [] // Initialize with an empty pages array
      });

      console.log("User registered successfully:", user._id);

      // Send success response after user is registered
      res.status(201).json({ 
          message: "User registered successfully",
          user: {
              id: user._id,
              username: user.username,
              email: user.email
          }
      });
  } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
          message: "Registration failed", 
          error: error.message 
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
              userId: user._id
          }, 
          process.env.JWT_SECRET, 
          { expiresIn: '1h' } // Token expires in 1 hour
      );

      // Send the token and user details in the response
      res.json({ 
          token,
          user: { 
              id: user._id, 
              username: user.username, 
              email: user.email 
          }
      });
  } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
          message: "Login failed", 
          error: error.message 
      });
  }
};

const addTimer = async(req, res) => {
  try {
      const { label, duration, pageId } = req.body;
  
      if (!label || !duration) {
        return res.status(400).json({ message: "Please provide both label and duration" });
      }
      
      if (!pageId) {
        return res.status(400).json({ message: "Please provide the page ID" });
      }
  
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Find the page with the given ID
      const pageIndex = user.pages.findIndex(page => page._id.toString() === pageId);
      if (pageIndex === -1) {
        return res.status(404).json({ message: "Page not found" });
      }
  
      const newTimer = {
        label,
        duration,
        status: "active", // Default status is active
        createdAt: new Date(),
      };
  
      user.pages[pageIndex].timers.push(newTimer);
      await user.save();
  
      res.json({
        message: "Timer added successfully",
        timers: user.pages[pageIndex].timers, // Send back the updated timers list for this page
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
        pages: user.pages, // Include all the user's pages with their timers
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
}

const deleteTimer = async(req, res) => {
  const { timerId } = req.params; // Get timer ID from URL
  const userId = req.userId;

  console.log("UserId in deleteTimer function:", userId);
  console.log("TimerId to delete:", timerId);

  try {
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Find which page contains the timer
      let timerFound = false;
      let updatedTimers = [];

      // Loop through each page to find and remove the timer
      for (let i = 0; i < user.pages.length; i++) {
          const page = user.pages[i];
          const timerIndex = page.timers.findIndex(timer => timer._id.toString() === timerId);
          
          if (timerIndex !== -1) {
              // Timer found on this page
              timerFound = true;
              // Remove the timer from this page's timers array
              page.timers.splice(timerIndex, 1);
              updatedTimers = page.timers;
              break;
          }
      }

      if (!timerFound) {
          return res.status(404).json({ message: 'Timer not found' });
      }

      // Save the updated user document
      await user.save();

      // Return updated list of timers
      res.status(200).json({ 
          message: "Timer deleted successfully",
          timers: updatedTimers 
      });
  } catch (error) {
      console.error("Error deleting timer:", error);
      res.status(500).json({ message: "Server error, failed to delete timer" });
  }
};



//RECIPE PAGES
const addRecipePage = async(req, res) => {
  try {
      const { label } = req.body;
  
      if (!label) {
        return res.status(400).json({ message: "Please provide a label for the recipe page" });
      }
  
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const newPage = {
        label,
        timers: [],
        unitConverters: []
      };
  
      user.pages.push(newPage);
      await user.save();
  
      res.json({
        message: "Recipe page added successfully",
        page: newPage,
        pages: user.pages
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
}

// Step 2: Create controller functions in controllers/userController.js

// Add these functions to userController.js:

// Add a unit converter to a specific recipe page
const addUnitConverter = async (req, res) => {
  try {
    const { pageId, category, fromUnit, toUnit, conversionFactor } = req.body;
    
    if (!pageId || !category || !fromUnit || !toUnit || !conversionFactor) {
      return res.status(400).json({ 
        message: "Please provide pageId, category, fromUnit, toUnit, and conversionFactor" 
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find the page with the given ID
    const pageIndex = user.pages.findIndex(page => page._id.toString() === pageId);
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }
    
    const newUnitConverter = {
      category,
      fromUnit,
      toUnit,
      conversionFactor,
      createdAt: new Date()
    };
    
    user.pages[pageIndex].unitConverters.push(newUnitConverter);
    await user.save();
    
    res.json({
      message: "Unit converter added successfully",
      unitConverters: user.pages[pageIndex].unitConverters
    });
  } catch (error) {
    console.error("Error adding unit converter:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all unit converters for a specific recipe page
const getUnitConverters = async (req, res) => {
  try {
    const { pageId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find the page with the given ID
    const page = user.pages.find(page => page._id.toString() === pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    
    res.json({
      unitConverters: page.unitConverters
    });
  } catch (error) {
    console.error("Error getting unit converters:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a unit converter from a recipe page
const deleteUnitConverter = async (req, res) => {
  try {
    const { pageId, converterId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find the page with the given ID
    const pageIndex = user.pages.findIndex(page => page._id.toString() === pageId);
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }
    
    // Find the converter in the page
    const converterIndex = user.pages[pageIndex].unitConverters.findIndex(
      converter => converter._id.toString() === converterId
    );
    
    if (converterIndex === -1) {
      return res.status(404).json({ message: "Unit converter not found" });
    }
    
    // Remove the converter
    user.pages[pageIndex].unitConverters.splice(converterIndex, 1);
    await user.save();
    
    res.json({
      message: "Unit converter deleted successfully",
      unitConverters: user.pages[pageIndex].unitConverters
    });
  } catch (error) {
    console.error("Error deleting unit converter:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a unit converter
const updateUnitConverter = async (req, res) => {
  try {
    const { pageId, converterId } = req.params;
    const { category, fromUnit, toUnit, conversionFactor } = req.body;
    
    if (!category || !fromUnit || !toUnit || !conversionFactor) {
      return res.status(400).json({ 
        message: "Please provide category, fromUnit, toUnit, and conversionFactor" 
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find the page with the given ID
    const pageIndex = user.pages.findIndex(page => page._id.toString() === pageId);
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }
    
    // Find the converter in the page
    const converterIndex = user.pages[pageIndex].unitConverters.findIndex(
      converter => converter._id.toString() === converterId
    );
    
    if (converterIndex === -1) {
      return res.status(404).json({ message: "Unit converter not found" });
    }
    
    // Update the converter
    user.pages[pageIndex].unitConverters[converterIndex] = {
      ...user.pages[pageIndex].unitConverters[converterIndex]._doc,
      category,
      fromUnit,
      toUnit,
      conversionFactor
    };
    
    await user.save();
    
    res.json({
      message: "Unit converter updated successfully",
      unitConverters: user.pages[pageIndex].unitConverters
    });
  } catch (error) {
    console.error("Error updating unit converter:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Exporting the register and login functions so they can be used in other parts of the application
module.exports = { 
   registerUser, 
   loginUser, 
   addTimer, 
   getUser, 
   deleteTimer, 
   addRecipePage,
   addUnitConverter,
   getUnitConverters,
   deleteUnitConverter,
   updateUnitConverter
};
