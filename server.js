const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./Routes/userRoutes");

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();

/**
 * Middleware to parse incoming JSON request bodies.
 * This middleware is used to automatically parse JSON payloads into `req.body`.
 */
app.use(express.json());

/**
 * Middleware to enable CORS (Cross-Origin Resource Sharing) for requests from localhost:3000.
 * This is needed to allow communication between the backend and a frontend application running on a different port.
 * 
 * @param {Object} options - The CORS configuration options
 * @param {string} options.origin - The allowed origin for CORS requests (localhost:3000 in this case)
 * @param {boolean} options.credentials - Indicates whether or not to allow credentials (cookies, authorization headers, etc.) with cross-origin requests
 */
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

/**
 * Middleware to parse cookies from incoming requests.
 * This middleware extracts cookies from the `Cookie` header and makes them available in `req.cookies`.
 */
app.use(cookieParser());

/**
 * Define routes for user-related API requests.
 * This middleware will handle all routes starting with "/api/users".
 */
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5690; // Set the port for the server

/**
 * Starts the Express server on the specified port.
 * Logs a message to the console when the server is successfully running.
 */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
