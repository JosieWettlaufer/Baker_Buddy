const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require("dotenv").config();


//Register new user
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
        return res.status(400).json({ message: "Username or Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully" });
};

//Login user and return JWT
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        
        return res.status(400).json({ message: "Invalid credentials" });
    }



    //Generate JWT token
    const token = jwt.sign({ id: user._id }, "your_super_secret_key", {
        expiresIn: '1h' });
        res.json({ 
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
};

module.exports = { registerUser, loginUser };