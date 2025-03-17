const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.id}` });
});

module.exports = router;