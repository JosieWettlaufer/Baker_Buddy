const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

/**
 * Registers a new user.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing user details.
 * @param {string} req.body.username - The desired username.
 * @param {string} req.body.password - The user's password.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with registration status and user details.
 */
const registerUser = async (req, res) => {
  const { username, password } = req.body;
  console.log("Registration request received:", { username });

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userExists = await User.findOne({ username }).select("_id");
    if (userExists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ username, password: hashedPassword, pages: [] });
    console.log("User registered successfully:", user._id);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

/**
 * Logs in a user and returns a JWT token.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing credentials.
 * @param {string} req.body.username - The user's username.
 * @param {string} req.body.password - The user's password.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with authentication token and user details.
 */
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

/**
 * Retrieves user details including their saved recipe pages.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with user pages.
 */
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: `Welcome, user ${req.user.id}`, pages: user.pages });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Adds a new recipe page for the user.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the recipe label.
 * @param {string} req.body.label - The label for the recipe page.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with the newly created page and updated pages list.
 */
const addRecipePage = async (req, res) => {
  try {
    const { label } = req.body;
    if (!label) {
      return res.status(400).json({ message: "Please provide a label for the recipe page" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newPage = { label, timers: [], unitConverters: [] };
    user.pages.push(newPage);
    await user.save();

    res.json({ message: "Recipe page added successfully", page: newPage, pages: user.pages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Deletes a recipe page for the user.
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.pageId - The ID of the recipe page to delete.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with the updated pages list after deletion.
 */
const deleteRecipePage = async (req, res) => {
  const { pageId } = req.params;
  const userId = req.userId;

  console.log("UserId in deletePage function:", userId);
  console.log("PageId to delete:", pageId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find index of the page to delete from the server
    const pageIndex = user.pages.findIndex(page => page._id.toString() === pageId);

    // Check if page exists
    if (pageIndex === -1) {
      return res.status(400).json({ message: "Recipe page not found" });
    }

    // Remove the page from the pages array
    user.pages.splice(pageIndex, 1); // 1 = one element removed at page index

    // Save changes
    await user.save();

    // Return success with updated array
    res.status(200).json({
      message: "Recipe page deleted successfully",
      pages: user.pages
    });
  } catch (error) {
    console.error("Error deleting page", error);
    res.status(500).json({ message: "Server error, failed to delete page" });
  }
};

module.exports = { registerUser, loginUser, getUser, addRecipePage, deleteRecipePage };
