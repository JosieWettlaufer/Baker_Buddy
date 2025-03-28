const express = require("express");

// Import controller methods
const {
  registerUser,
  loginUser,
  getUser,
  addRecipePage,
  deleteRecipePage,
} = require("../controllers/userController");
const { addTimer, deleteTimer } = require("../controllers/timerController");
const { 
  addUnitConverter, 
  getUnitConverters, 
  deleteUnitConverter, 
  updateUnitConverter 
} = require("../controllers/unitController");

const protect = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * Route to register a new user.
 * Calls the `registerUser` method from the user controller.
 * 
 * @route POST /register
 * @returns {Object} 200 - Success message
 * @returns {Object} 400 - Error message if registration fails
 */
router.post("/register", registerUser);

/**
 * Route to login an existing user.
 * Calls the `loginUser` method from the user controller.
 * 
 * @route POST /login
 * @returns {Object} 200 - Success message with user data
 * @returns {Object} 401 - Error message if login fails
 */
router.post("/login", loginUser);

/**
 * Route to get the user’s dashboard after authentication.
 * Protects the route with the `protect` middleware.
 * Calls the `getUser` method from the user controller.
 * 
 * @route GET /dashboard
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} 200 - User data
 * @returns {Object} 401 - Error message if unauthorized
 */
router.get("/dashboard", protect, getUser);

/**
 * Route to add a new recipe page for the authenticated user.
 * Protects the route with the `protect` middleware.
 * Calls the `addRecipePage` method from the user controller.
 * 
 * @route POST /addPage
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} 200 - Success message
 * @returns {Object} 401 - Error message if unauthorized
 */
router.post("/addPage", protect, addRecipePage);

/**
 * Route to delete an existing recipe page by page ID.
 * Protects the route with the `protect` middleware.
 * Calls the `deleteRecipePage` method from the user controller.
 * 
 * @route DELETE /deletePage/:pageId
 * @param {string} pageId - The ID of the page to delete
 * @returns {Object} 200 - Success message
 * @returns {Object} 401 - Error message if unauthorized
 */
router.delete("/deletePage/:pageId", protect, deleteRecipePage);

/**
 * Route to add a new timer for a recipe.
 * Protects the route with the `protect` middleware.
 * Calls the `addTimer` method from the timer controller.
 * 
 * @route POST /addTimer
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} 200 - Success message
 * @returns {Object} 401 - Error message if unauthorized
 */
router.post("/addTimer", protect, addTimer);

/**
 * Route to delete a timer by timer ID.
 * Protects the route with the `protect` middleware.
 * Calls the `deleteTimer` method from the timer controller.
 * 
 * @route DELETE /deleteTimer/:timerId
 * @param {string} timerId - The ID of the timer to delete
 * @returns {Object} 200 - Success message
 * @returns {Object} 401 - Error message if unauthorized
 */
router.delete("/deleteTimer/:timerId", protect, deleteTimer);

/**
 * Route to add a unit converter to a recipe page.
 * Protects the route with the `protect` middleware.
 * Calls the `addUnitConverter` method from the unit controller.
 * 
 * @route POST /pages/:pageId/unitConverters
 * @param {string} pageId - The ID of the recipe page
 * @param {Object} req - The request object containing unit converter data
 * @param {Object} res - The response object
 * @returns {Object} 200 - Success message
 * @returns {Object} 401 - Error message if unauthorized
 */
router.post("/pages/:pageId/unitConverters", protect, addUnitConverter);

/**
 * Route to get all unit converters for a specific recipe page.
 * Protects the route with the `protect` middleware.
 * Calls the `getUnitConverters` method from the unit controller.
 * 
 * @route GET /pages/:pageId/unitConverters
 * @param {string} pageId - The ID of the recipe page
 * @returns {Array} 200 - List of unit converters for the recipe page
 * @returns {Object} 401 - Error message if unauthorized
 */
router.get("/pages/:pageId/unitConverters", protect, getUnitConverters);

/**
 * Route to delete a specific unit converter by converter ID.
 * Protects the route with the `protect` middleware.
 * Calls the `deleteUnitConverter` method from the unit controller.
 * 
 * @route DELETE /pages/:pageId/unitConverters/:converterId
 * @param {string} pageId - The ID of the recipe page
 * @param {string} converterId - The ID of the unit converter to delete
 * @returns {Object} 200 - Success message
 * @returns {Object} 401 - Error message if unauthorized
 */
router.delete("/pages/:pageId/unitConverters/:converterId", protect, deleteUnitConverter);

/**
 * Route to update a specific unit converter by converter ID.
 * Protects the route with the `protect` middleware.
 * Calls the `updateUnitConverter` method from the unit controller.
 * 
 * @route PUT /pages/:pageId/unitConverters/:converterId
 * @param {string} pageId - The ID of the recipe page
 * @param {string} converterId - The ID of the unit converter to update
 * @param {Object} req - The request object containing updated unit converter data
 * @param {Object} res - The response object
 * @returns {Object} 200 - Success message
 * @returns {Object} 401 - Error message if unauthorized
 */
router.put("/pages/:pageId/unitConverters/:converterId", protect, updateUnitConverter);

module.exports = router;
