import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import cors from "cors";
import corsOptions from "./config/corsOptions";
import isCorsEnabled from "./config/isCorsEnabled";

import compression from "compression";
import compressionFilter from "./config/compressionFilter";

import generalLimiter from "./rateLimiter/general";
import isRateLimitingEnabled from "./config/isRateLimitingEnabled";

import * as routes from "./routes";
import getEnv from "./utils/getEnv";

console.log(`Running ${__filename}`);
// Load the environment variables from the .env file
dotenv.config();

// Create an express app
const app = express();
// Use JSON middleware to parse the request body
app.use(express.json());
if (isRateLimitingEnabled) {
    app.set("trust proxy", 1);
    app.use(generalLimiter);
} else {
    console.warn(
        "Rate limiting is disabled. It's recommended to enable it. Use only for development purposes.",
    );
}
if (isCorsEnabled) {
    app.use(cors(corsOptions));
} else {
    app.use(cors());
    console.warn(
        "CORS is disabled. It's recommended to enable it. Use only for development purposes.",
    );
}
const compressionOptions = {
    filter: compressionFilter,
} as const;
app.use(compression(compressionOptions));
// Connect to the MongoDB database using mongoose
console.log("Trying to connect to mongoDB...");
try {
    console.time("Connect to MongoDB");
    await mongoose.connect(getEnv().MONGO_URI);
    console.timeEnd("Connect to MongoDB");
} catch (error) {
    console.error("Failed to connect to MongoDB: \n" + error);
    process.exit(1);
}
console.log("Connected to MongoDB");
// Register and login
app.use("/register", routes.register);
app.use("/login", routes.login);
// Admin
app.use("/admin/assign", routes.assign);
// Solves
app.use("/solves/add", routes.addSolve);
app.use("/solves/delete", routes.deleteSolve);
app.use("/solves/get", routes.getSolve);
// Users
app.use("/users", routes.getAllUsers);
app.use("/users", routes.getUser);
app.use("/users", routes.deleteUser);
app.use("/users", routes.changePassword);
// Posts
app.use("/posts", routes.newPost);
app.use("/posts", routes.getPost);
app.use("/posts", routes.deletePost);
app.use("/posts", routes.editPost);
// Results in excel
app.use("/results", routes.results);
// Token validation
app.use("/token", routes.validateToken);
app.use("/health-check", routes.healthCheck);
// Competitions
app.use("/competitions", routes.createCompetition);
app.use("/competitions", routes.getCompetition);
app.use("/competitions", routes.deleteCompetition);
app.use("/competitions", routes.editCompetition);
app.use("/competitions", routes.lockCompetition);
app.use("/competitions", routes.competitionResults);
// Backup
app.use("/backup", routes.backup);

// Start the server on the specified port
const PORT = getEnv().PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
