// Importing the User model to interact with the database
const User = require("../models/User");

// Function to add a new unit converter to a specific page
const addUnitConverter = async (req, res) => {
  try {
    // Extracting unit converter details from request body
    const { pageId, category, fromUnit, toUnit, conversionFactor } = req.body;

    // Validating that all required fields are provided
    if (!pageId || !category || !fromUnit || !toUnit || !conversionFactor) {
      return res.status(400).json({
        message:
          "Please provide pageId, category, fromUnit, toUnit, and conversionFactor",
      });
    }

    // Fetching the user from the database using their ID from the request 
    const user = await User.findById(req.user.id); //provided by authMiddleware 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Finding the page with the given ID in the user's pages array
    const pageIndex = user.pages.findIndex(
      (page) => page._id.toString() === pageId //checks each page if equal to pageId
    );

    // If the page is not found, return an error
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Creating a new unit converter object
    const newUnitConverter = {
      category,
      fromUnit,
      toUnit,
      conversionFactor,
    };

    // Adding the new unit converter to the selected page's unitConverters array
    user.pages[pageIndex].unitConverters.push(newUnitConverter);

    // Saving the updated user document to the database
    await user.save();

    // Sending a success response with the updated unit converters list
    res.json({
      message: "Unit converter added successfully",
      unitConverters: user.pages[pageIndex].unitConverters,
    });
  } catch (error) {
    console.error("Error adding unit converter:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Function to retrieve all unit converters for a specific recipe page
const getUnitConverters = async (req, res) => {
  try {
    // Extracting page ID from request parameters
    const { pageId } = req.params;

    // Fetching the user from the database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Finding the page with the given ID in the user's pages array
    const page = user.pages.find((page) => page._id.toString() === pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Sending a response with the unit converters for the specified page
    res.json({
      unitConverters: page.unitConverters,
    });
  } catch (error) {
    console.error("Error getting unit converters:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Function to delete a unit converter from a recipe page
const deleteUnitConverter = async (req, res) => {
  try {
    // Extracting page ID and converter ID from request parameters
    const { pageId, converterId } = req.params;

    // Fetching the user from the database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Finding the page with the given ID in the user's pages array
    const pageIndex = user.pages.findIndex(
      (page) => page._id.toString() === pageId
    );
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Finding the unit converter within the page
    const converterIndex = user.pages[pageIndex].unitConverters.findIndex(
      (converter) => converter._id.toString() === converterId
    );

    // If the unit converter is not found, return an error
    if (converterIndex === -1) {
      return res.status(404).json({ message: "Unit converter not found" });
    }

    // Removing the unit converter from the page's unitConverters array
    user.pages[pageIndex].unitConverters.splice(converterIndex, 1);

    // Saving the updated user document to persist the deletion
    await user.save();

    // Sending a success response with the updated unit converters list
    res.json({
      message: "Unit converter deleted successfully",
      unitConverters: user.pages[pageIndex].unitConverters,
    });
  } catch (error) {
    console.error("Error deleting unit converter:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Function to update an existing unit converter
const updateUnitConverter = async (req, res) => {
  try {
    // Extracting page ID and converter ID from request parameters
    const { pageId, converterId } = req.params;

    // Extracting updated converter details from request body
    const { category, fromUnit, toUnit, conversionFactor } = req.body;

    // Validating that all required fields are provided
    if (!category || !fromUnit || !toUnit || !conversionFactor) {
      return res.status(400).json({
        message:
          "Please provide category, fromUnit, toUnit, and conversionFactor",
      });
    }

    // Fetching the user from the database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Finding the page with the given ID in the user's pages array
    const pageIndex = user.pages.findIndex(
      (page) => page._id.toString() === pageId
    );
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Finding the unit converter within the page
    const converterIndex = user.pages[pageIndex].unitConverters.findIndex(
      (converter) => converter._id.toString() === converterId
    );

    // If the unit converter is not found, return an error
    if (converterIndex === -1) {
      return res.status(404).json({ message: "Unit converter not found" });
    }

    // Updating the unit converter with new values
    user.pages[pageIndex].unitConverters[converterIndex] = {
      ...user.pages[pageIndex].unitConverters[converterIndex]._doc,
      category,
      fromUnit,
      toUnit,
      conversionFactor,
    };

    // Saving the updated user document to persist the changes
    await user.save();

    // Sending a success response with the updated unit converters list
    res.json({
      message: "Unit converter updated successfully",
      unitConverters: user.pages[pageIndex].unitConverters,
    });
  } catch (error) {
    console.error("Error updating unit converter:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Exporting the unit converter functions so they can be used in other parts of the application
module.exports = {
  addUnitConverter,
  getUnitConverters,
  deleteUnitConverter,
  updateUnitConverter,
};
