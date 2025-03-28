const User = require("../models/User");

/**
 * Adds a new timer to a specific page.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing timer details.
 * @param {string} req.body.label - The label/name of the timer.
 * @param {number} req.body.duration - The duration of the timer (in seconds).
 * @param {string} req.body.pageId - The ID of the page where the timer will be added.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with a success message and updated timers list.
 * @throws {Error} - Returns an error response if validation fails or if the database operation encounters an issue.
 */
const addTimer = async (req, res) => {
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

    const pageIndex = user.pages.findIndex((page) => page._id.toString() === pageId);
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }

    const newTimer = { label, duration, status: "active" };
    user.pages[pageIndex].timers.push(newTimer);
    await user.save();

    res.json({ message: "Timer added successfully", timers: user.pages[pageIndex].timers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Deletes a timer by its ID.
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.timerId - The ID of the timer to be deleted.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a JSON response with a success message and updated timers list.
 * @throws {Error} - Returns an error response if the user or timer is not found.
 */
const deleteTimer = async (req, res) => {
  const { timerId } = req.params;
  const userId = req.userId;

  console.log("UserId in deleteTimer function:", userId);
  console.log("TimerId to delete:", timerId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let timerFound = false;
    let updatedTimers = [];

    for (let i = 0; i < user.pages.length; i++) {
      const page = user.pages[i];
      const timerIndex = page.timers.findIndex((timer) => timer._id.toString() === timerId);

      if (timerIndex !== -1) {
        timerFound = true;
        page.timers.splice(timerIndex, 1);
        updatedTimers = page.timers;
        break;
      }
    }

    if (!timerFound) {
      return res.status(404).json({ message: "Timer not found" });
    }

    await user.save();
    res.status(200).json({ message: "Timer deleted successfully", timers: updatedTimers });
  } catch (error) {
    console.error("Error deleting timer:", error);
    res.status(500).json({ message: "Server error, failed to delete timer" });
  }
};

module.exports = { addTimer, deleteTimer };
