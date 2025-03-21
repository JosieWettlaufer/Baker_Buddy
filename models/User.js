const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const timerSchema = new mongoose.Schema({
  label: { type: String, required: true }, 
  duration: { type: Number, required: true }, // Duration in seconds
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: {type: String, required: true},
  password: { type: String, required: true },
  timers: [timerSchema] // List of timers
  
});




module.exports = mongoose.model('User', userSchema);