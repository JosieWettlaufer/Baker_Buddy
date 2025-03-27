const express = require("express");
const {
  registerUser,
  loginUser,
  addTimer,
  getUser,
  deleteTimer,
  addRecipePage,
  addUnitConverter,
  getUnitConverters,
  deleteUnitConverter,
  updateUnitConverter,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// User dashboard
router.get("/dashboard", protect, getUser);

// Recipe page routes
router.post("/addPage", protect, addRecipePage);

// Timer routes
router.post("/addTimer", protect, addTimer);
router.delete("/deleteTimer/:timerId", protect, deleteTimer);

// Unit converter routes
router.post("/pages/:pageId/unitConverters", protect, addUnitConverter);
router.get("/pages/:pageId/unitConverters", protect, getUnitConverters);
router.delete(
  "/pages/:pageId/unitConverters/:converterId",
  protect,
  deleteUnitConverter
);
router.put(
  "/pages/:pageId/unitConverters/:converterId",
  protect,
  updateUnitConverter
);

module.exports = router;
