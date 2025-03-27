// Importing the User model to interact with the database
const User = require("../models/User");

// Function to add a new timer to a specific page
const addTimer = async (req, res) => {
  try {
    // Extracting timer details from request body
    const { label, duration, pageId } = req.body;

    // Validating that label and duration are provided
    if (!label || !duration) {
      return res
        .status(400)
        .json({ message: "Please provide both label and duration" });
    }

    // Ensuring a page ID is provided
    if (!pageId) {
      return res.status(400).json({ message: "Please provide the page ID" });
    }

    // Fetching the user from the database using their ID from the request
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Finding the page with the given ID in the user's pages array
    const pageIndex = user.pages.findIndex(
      (page) => page._id.toString() === pageId
    );

    // If page is not found, return an error
    if (pageIndex === -1) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Creating a new timer object
    const newTimer = {
      label,
      duration,
      status: "active", // Default status set to active
    };

    // Adding the new timer to the selected page's timers array
    user.pages[pageIndex].timers.push(newTimer);

    // Saving the updated user document to the database
    await user.save();

    // Sending a success response with the updated timers list
    res.json({
      message: "Timer added successfully",
      timers: user.pages[pageIndex].timers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Function to delete a timer by its ID
const deleteTimer = async (req, res) => {
  // Extracting the timer ID from request parameters
  const { timerId } = req.params;
  const userId = req.userId; // Getting user ID from the request

  console.log("UserId in deleteTimer function:", userId);
  console.log("TimerId to delete:", timerId);

  try {
    // Finding the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Searching for the page that contains the timer
    let timerFound = false;
    let updatedTimers = [];

    // Iterating through the user's pages to locate the timer
    for (let i = 0; i < user.pages.length; i++) {
      const page = user.pages[i];

      // Finding the timer inside the current page
      const timerIndex = page.timers.findIndex(
        (timer) => timer._id.toString() === timerId
      );

      if (timerIndex !== -1) {
        // Timer found in this page
        timerFound = true;

        // Removing the timer from the page's timers array
        page.timers.splice(timerIndex, 1);

        // Storing the updated timers list for response
        updatedTimers = page.timers;
        break; // Exit loop since the timer is found
      }
    }

    // If no timer was found in any of the user's pages, return an error
    if (!timerFound) {
      return res.status(404).json({ message: "Timer not found" });
    }

    // Saving the updated user document to persist the deletion
    await user.save();

    // Returning a success response with the updated timers list
    res.status(200).json({
      message: "Timer deleted successfully",
      timers: updatedTimers,
    });
  } catch (error) {
    console.error("Error deleting timer:", error);
    res.status(500).json({ message: "Server error, failed to delete timer" });
  }
};

// Exporting the addTimer and deleteTimer functions for use in other parts of the application
module.exports = {
  addTimer,
  deleteTimer,
};
