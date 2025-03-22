import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import corsOptions from "./config/corsOptions";
import isCorsEnabled from "./config/isCorsEnabled";
import compression from "compression";
import compressionFilter from "./config/compressionFilter";
import generalLimiter from "./rateLimiter/general";
import isRateLimitingEnabled from "./config/isRateLimitingEnabled";
import * as routes from "./routes";
import getEnv from "./utils/getEnv";
import MongoStore from "connect-mongo";

console.log(`Running ${__filename}`);
dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(cookieParser()); // Cookie parsing middleware

// Session configuration
app.use(
    session({
        secret: getEnv().SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            sameSite: "none",
        },
        // For production, use a proper store like:
        store: MongoStore.create({ mongoUrl: getEnv().MONGO_URI }),
    }),
);

// Security middleware
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

// Compression
const compressionOptions = {
    filter: compressionFilter,
} as const;
app.use(compression(compressionOptions));

// Database connection
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

// Routes
app.use("/register", routes.register);
app.use("/login", routes.login);
app.use("/admin/assign", routes.assign);
app.use("/solves/add", routes.addSolve);
app.use("/solves/delete", routes.deleteSolve);
app.use("/solves/get", routes.getSolve);
app.use("/users", routes.getAllUsers);
app.use("/users", routes.getUser);
app.use("/users", routes.deleteUser);
app.use("/users", routes.changePassword);
app.use("/posts", routes.newPost);
app.use("/posts", routes.getPost);
app.use("/posts", routes.deletePost);
app.use("/posts", routes.editPost);
app.use("/results", routes.results);
app.use("/health-check", routes.healthCheck);
app.use("/competitions", routes.createCompetition);
app.use("/competitions", routes.getCompetition);
app.use("/competitions", routes.deleteCompetition);
app.use("/competitions", routes.editCompetition);
app.use("/competitions", routes.lockCompetition);
app.use("/competitions", routes.competitionResults);
app.use("/backup", routes.backup);

app.use("/session", routes.validateSession);
app.use("/session", routes.logout);

// Server startup
const PORT = getEnv().PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
