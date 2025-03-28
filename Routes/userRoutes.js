const express = require("express");

//Import controller methods
const {
  registerUser,
  loginUser,
  getUser,
  addRecipePage,
  deleteRecipePage,
} = require("../controllers/userController");
const { addTimer, deleteTimer } = require("../controllers/timerController");
const { 
    addUnitConverter, 
    getUnitConverters, 
    deleteUnitConverter, 
    updateUnitConverter 
} = require("../controllers/unitController");

const protect = require("../middleware/authMiddleware");
const router = express.Router();

//UserController method routes
router.post("/register", registerUser);
router.post("/login", loginUser);
// User dashboard
router.get("/dashboard", protect, getUser);
// Recipe page routes
router.post("/addPage", protect, addRecipePage);
router.delete("/deletePage/:pageId", protect, deleteRecipePage);

// TimerController method routes
router.post("/addTimer", protect, addTimer);
router.delete("/deleteTimer/:timerId", protect, deleteTimer);

// UnitController method routes
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
