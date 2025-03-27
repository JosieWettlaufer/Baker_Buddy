const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./Routes/userRoutes");

dotenv.config();
connectDB();

const app = express();
//Parse incoming JSON req bodies
app.use(express.json());
//Enable CORS from localhost:3000 (for react frontend)
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
//middleware to parse cookies from incoming requests
app.use(cookieParser());

//use auth routes defined in authRoutes.js file
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5690;

//start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
