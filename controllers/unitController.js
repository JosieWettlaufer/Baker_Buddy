// Importing the User model to interact with the database
const User = require("../models/User");

const addUnitConverter = async (req, res) => {
  try {
    const { pageId, category, fromUnit, toUnit, conversionFactor } = req.body;

    if (!pageId || !category || !fromUnit || !toUnit || !conversionFactor) {
      return res.status(400).json({
        message:
          "Please provide pageId, category, fromUnit, toUnit, and conversionFactor",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the page with the given ID
    const pageIndex = user.pages.findIndex(
      (page) => page._id.toString() === pageId
    );
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }

    const newUnitConverter = {
      category,
      fromUnit,
      toUnit,
      conversionFactor,
      createdAt: new Date(),
    };

    user.pages[pageIndex].unitConverters.push(newUnitConverter);
    await user.save();

    res.json({
      message: "Unit converter added successfully",
      unitConverters: user.pages[pageIndex].unitConverters,
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
    const page = user.pages.find((page) => page._id.toString() === pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json({
      unitConverters: page.unitConverters,
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
    const pageIndex = user.pages.findIndex(
      (page) => page._id.toString() === pageId
    );
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Find the converter in the page
    const converterIndex = user.pages[pageIndex].unitConverters.findIndex(
      (converter) => converter._id.toString() === converterId
    );

    if (converterIndex === -1) {
      return res.status(404).json({ message: "Unit converter not found" });
    }

    // Remove the converter
    user.pages[pageIndex].unitConverters.splice(converterIndex, 1);
    await user.save();

    res.json({
      message: "Unit converter deleted successfully",
      unitConverters: user.pages[pageIndex].unitConverters,
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
        message:
          "Please provide category, fromUnit, toUnit, and conversionFactor",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the page with the given ID
    const pageIndex = user.pages.findIndex(
      (page) => page._id.toString() === pageId
    );
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Find the converter in the page
    const converterIndex = user.pages[pageIndex].unitConverters.findIndex(
      (converter) => converter._id.toString() === converterId
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
      conversionFactor,
    };

    await user.save();

    res.json({
      message: "Unit converter updated successfully",
      unitConverters: user.pages[pageIndex].unitConverters,
    });
  } catch (error) {
    console.error("Error updating unit converter:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Exporting the register and login functions so they can be used in other parts of the application
module.exports = {
  addUnitConverter,
  getUnitConverters,
  deleteUnitConverter,
  updateUnitConverter,
};