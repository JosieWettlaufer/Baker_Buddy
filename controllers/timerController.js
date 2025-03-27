// Importing the User model to interact with the database
const User = require("../models/User");

const addTimer = async (req, res) => {
  try {
    const { label, duration, pageId } = req.body;

    if (!label || !duration) {
      return res
        .status(400)
        .json({ message: "Please provide both label and duration" });
    }

    if (!pageId) {
      return res.status(400).json({ message: "Please provide the page ID" });
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
};

const deleteTimer = async (req, res) => {
  const { timerId } = req.params; // Get timer ID from URL
  const userId = req.userId;

  console.log("UserId in deleteTimer function:", userId);
  console.log("TimerId to delete:", timerId);

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find which page contains the timer
    let timerFound = false;
    let updatedTimers = [];

    // Loop through each page to find and remove the timer
    for (let i = 0; i < user.pages.length; i++) {
      const page = user.pages[i];
      const timerIndex = page.timers.findIndex(
        (timer) => timer._id.toString() === timerId
      );

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
      return res.status(404).json({ message: "Timer not found" });
    }

    // Save the updated user document
    await user.save();

    // Return updated list of timers
    res.status(200).json({
      message: "Timer deleted successfully",
      timers: updatedTimers,
    });
  } catch (error) {
    console.error("Error deleting timer:", error);
    res.status(500).json({ message: "Server error, failed to delete timer" });
  }
};

// Exporting the register and login functions so they can be used in other parts of the application
module.exports = {
  addTimer,
  deleteTimer,
};
