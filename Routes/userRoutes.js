const express = require('express');
const { registerUser, loginUser, deleteTimer } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

const User = require('../models/User');  // Make sure this path is correct


router.post('/register', registerUser);
router.post('/login', loginUser);

// Route to add a timer for the logged-in user
router.post("/addTimer", protect, async (req, res) => {
  try {
    const { label, duration } = req.body;

    if (!label || !duration) {
      return res.status(400).json({ message: "Please provide both label and duration" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newTimer = {
      label,
      duration,
      status: "active", // Default status is active
      createdAt: new Date(),
    };

    user.timers.push(newTimer);
    await user.save();

    res.json({
      message: "Timer added successfully",
      timers: user.timers, // Send back the updated timers list
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/dashboard", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: `Welcome, user ${req.user.id}`,
      timers: user.timers, // Include the user's timers
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.delete('/deleteTimer/:timerId', protect, deleteTimer);

module.exports = router;