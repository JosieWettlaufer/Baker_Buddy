const express = require('express');
const { registerUser, loginUser, addTimer, getUser, deleteTimer } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Route to add a timer for the logged-in user
router.post("/addTimer", protect, addTimer);

router.get("/dashboard", protect, getUser);

router.delete('/deleteTimer/:timerId', protect, deleteTimer);

module.exports = router;