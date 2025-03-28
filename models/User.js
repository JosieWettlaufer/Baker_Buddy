const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Timer schema for storing timer information.
 * Each timer has a label, duration, and status.
 * 
 * @typedef {Object} Timer
 * @property {string} label - The label for the timer.
 * @property {number} duration - The duration of the timer in seconds.
 * @property {string} [status="active"] - The status of the timer, default is "active".
 */
const timerSchema = new mongoose.Schema({
  label: { type: String, required: true },
  duration: { type: Number, required: true }, // Duration in seconds
  status: { type: String, default: "active" },
});

/**
 * Unit conversion schema for storing unit conversion details.
 * Each conversion includes a category, from and to units, and the conversion factor.
 * 
 * @typedef {Object} UnitConverter
 * @property {string} category - The category of the unit converter (e.g., temperature, weight).
 * @property {string} fromUnit - The unit to convert from.
 * @property {string} toUnit - The unit to convert to.
 * @property {number} conversionFactor - The factor used to convert from the 'fromUnit' to the 'toUnit'.
 */
const unitSchema = new mongoose.Schema({
  category: { type: String, required: true },
  fromUnit: { type: String, required: true },
  toUnit: { type: String, required: true },
  conversionFactor: { type: Number, required: true },
});

/**
 * Recipe page schema for storing information about individual recipe pages.
 * Each page includes a label, an array of timers, and an array of unit converters.
 * 
 * @typedef {Object} RecipePage
 * @property {string} label - The label for the recipe page.
 * @property {Array<Timer>} timers - The list of timers associated with the recipe page.
 * @property {Array<UnitConverter>} unitConverters - The list of unit converters associated with the recipe page.
 */
const recipePageSchema = new mongoose.Schema({
  label: { type: String, required: true },
  timers: [timerSchema],
  unitConverters: [unitSchema],
});

/**
 * User schema for storing user information, including username, password, and associated recipe pages.
 * 
 * @typedef {Object} User
 * @property {string} username - The unique username for the user.
 * @property {string} password - The hashed password for the user.
 * @property {Array<RecipePage>} pages - The list of recipe pages associated with the user.
 */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pages: [recipePageSchema],
});

/**
 * User model for interacting with the users collection in MongoDB.
 * 
 * @type {mongoose.Model<User>}
 */
module.exports = mongoose.model("User", userSchema);
