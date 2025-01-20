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
    // @ts-expect-error TODO: We will come back to this later
    await mongoose.connect(process.env.MONGO_URI);
    console.timeEnd("Connect to MongoDB");
} catch (error) {
    console.error("Failed to connect to MongoDB: \n" + error);
    process.exit(1);
}
console.log("Connected to MongoDB");

// Register and login
app.use("/register", await import("./routes/users/register"));
app.use("/login", require("./routes/users/login"));
// Admin
app.use("/admin/assign", require("./routes/admin/assign"));
// Solves
app.use("/solves/add", require("./routes/solves/add"));
app.use("/solves/delete", require("./routes/solves/delete"));
app.use("/solves/get", require("./routes/solves/get"));
// Users
app.use("/users", require("./routes/users/all"));
app.use("/users", require("./routes/users/get"));
app.use("/users", require("./routes/users/delete"));
app.use("/users", require("./routes/users/change-password"));
// Posts
app.use("/posts", require("./routes/posts/new"));
app.use("/posts", require("./routes/posts/get"));
app.use("/posts", require("./routes/posts/delete"));
app.use("/posts", require("./routes/posts/edit"));
// Results in excel
app.use("/results", require("./routes/excel/results"));
// Winner
app.use("/winner", require("./routes/winner/announce"));
app.use("/winner", require("./routes/winner/get"));
// Token validation
app.use("/token", require("./routes/token/validate"));
app.use("/health-check", require("./routes/health_check/health_check"));
// Competitions
app.use("/competitions", require("./routes/competitions/create"));
app.use("/competitions", require("./routes/competitions/get"));
app.use("/competitions", require("./routes/competitions/delete"));
app.use("/competitions", require("./routes/competitions/edit"));
app.use("/competitions", require("./routes/competitions/lock"));
app.use("/competitions", require("./routes/competitions/results"));
// Backup
app.use("/backup", require("./routes/backup/get"));

// Start the server on the specified port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
