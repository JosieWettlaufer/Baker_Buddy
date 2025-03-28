const User = require("../models/User");

/**
 * Adds a new unit converter to a specific page.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing converter details.
 * @param {string} req.body.pageId - The ID of the page where the converter will be added.
 * @param {string} req.body.category - The category of conversion (e.g., length, weight).
 * @param {string} req.body.fromUnit - The unit to convert from.
 * @param {string} req.body.toUnit - The unit to convert to.
 * @param {number} req.body.conversionFactor - The conversion factor between the units.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with a success message and updated unit converters.
 * @throws {Error} - Returns an error response if validation fails or if the database operation encounters an issue.
 */
const addUnitConverter = async (req, res) => {
  try {
    const { pageId, category, fromUnit, toUnit, conversionFactor } = req.body;

    if (!pageId || !category || !fromUnit || !toUnit || !conversionFactor) {
      return res.status(400).json({
        message: "Please provide pageId, category, fromUnit, toUnit, and conversionFactor",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pageIndex = user.pages.findIndex((page) => page._id.toString() === pageId);
    if (pageIndex === -1) return res.status(404).json({ message: "Page not found" });

    const newUnitConverter = { category, fromUnit, toUnit, conversionFactor };
    user.pages[pageIndex].unitConverters.push(newUnitConverter);
    await user.save();

    res.json({ message: "Unit converter added successfully", unitConverters: user.pages[pageIndex].unitConverters });
  } catch (error) {
    console.error("Error adding unit converter:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieves all unit converters for a specific page.
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.pageId - The ID of the page to fetch converters from.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with a list of unit converters.
 * @throws {Error} - Returns an error if the user or page is not found.
 */
const getUnitConverters = async (req, res) => {
  try {
    const { pageId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const page = user.pages.find((page) => page._id.toString() === pageId);
    if (!page) return res.status(404).json({ message: "Page not found" });

    res.json({ unitConverters: page.unitConverters });
  } catch (error) {
    console.error("Error getting unit converters:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Deletes a unit converter from a specific page.
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.pageId - The ID of the page containing the converter.
 * @param {string} req.params.converterId - The ID of the converter to be deleted.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response confirming deletion.
 * @throws {Error} - Returns an error if the user, page, or converter is not found.
 */
const deleteUnitConverter = async (req, res) => {
  try {
    const { pageId, converterId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pageIndex = user.pages.findIndex((page) => page._id.toString() === pageId);
    if (pageIndex === -1) return res.status(404).json({ message: "Page not found" });

    const converterIndex = user.pages[pageIndex].unitConverters.findIndex(
      (converter) => converter._id.toString() === converterId
    );

    if (converterIndex === -1) return res.status(404).json({ message: "Unit converter not found" });

    user.pages[pageIndex].unitConverters.splice(converterIndex, 1);
    await user.save();

    res.json({ message: "Unit converter deleted successfully", unitConverters: user.pages[pageIndex].unitConverters });
  } catch (error) {
    console.error("Error deleting unit converter:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Updates an existing unit converter.
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.pageId - The ID of the page containing the converter.
 * @param {string} req.params.converterId - The ID of the converter to update.
 * @param {Object} req.body - The updated converter details.
 * @param {string} req.body.category - The updated category of conversion.
 * @param {string} req.body.fromUnit - The updated unit to convert from.
 * @param {string} req.body.toUnit - The updated unit to convert to.
 * @param {number} req.body.conversionFactor - The updated conversion factor.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with the updated unit converters.
 * @throws {Error} - Returns an error if the user, page, or converter is not found.
 */
const updateUnitConverter = async (req, res) => {
  try {
    const { pageId, converterId } = req.params;
    const { category, fromUnit, toUnit, conversionFactor } = req.body;

    if (!category || !fromUnit || !toUnit || !conversionFactor) {
      return res.status(400).json({
        message: "Please provide category, fromUnit, toUnit, and conversionFactor",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pageIndex = user.pages.findIndex((page) => page._id.toString() === pageId);
    if (pageIndex === -1) return res.status(404).json({ message: "Page not found" });

    const converterIndex = user.pages[pageIndex].unitConverters.findIndex(
      (converter) => converter._id.toString() === converterId
    );

    if (converterIndex === -1) return res.status(404).json({ message: "Unit converter not found" });

    user.pages[pageIndex].unitConverters[converterIndex] = {
      ...user.pages[pageIndex].unitConverters[converterIndex]._doc,
      category,
      fromUnit,
      toUnit,
      conversionFactor,
    };

    await user.save();

    res.json({ message: "Unit converter updated successfully", unitConverters: user.pages[pageIndex].unitConverters });
  } catch (error) {
    console.error("Error updating unit converter:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addUnitConverter, getUnitConverters, deleteUnitConverter, updateUnitConverter };
