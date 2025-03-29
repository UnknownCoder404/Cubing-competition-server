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
import { errorHandler } from "./middleware/errorHandler";
import { setupGlobalErrorHandlers } from "./utils/processHandlers";
import { setupGracefulShutdown } from "./utils/gracefulShutdown";
import { sessionErrorHandler } from "./middleware/sessionErrorHandler";

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
            sameSite: "lax",
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
// Auth routes
app.use("/auth/login", routes.login);
app.use("/auth/session", routes.validateSession);
app.use("/auth/session/logout", routes.logout);

// User routes
app.use("/users", routes.getAllUsers);
app.use("/users", routes.getUser);
app.use("/users", routes.deleteUser);
app.use("/users", routes.changePassword);
app.use("/users", routes.toggleAdmin);
app.use("/users", routes.register);

// Solves routes
app.use("/solves", routes.getSolve);
app.use("/solves", routes.addSolve);
app.use("/solves", routes.deleteSolve);

// Posts routes
app.use("/posts", routes.getPost);
app.use("/posts", routes.newPost);
app.use("/posts", routes.editPost);
app.use("/posts", routes.deletePost);

// Competition routes
app.use("/competitions", routes.getCompetition);
app.use("/competitions", routes.createCompetition);
app.use("/competitions", routes.deleteCompetition);
app.use("/competitions", routes.editCompetition);
app.use("/competitions", routes.lockCompetition);
app.use("/competitions", routes.competitionResults);
app.use("/competitions", routes.results);

// System routes
app.use("/system/backup", routes.backup);
app.use("/system/health", routes.healthCheck);

app.use(sessionErrorHandler);
app.use(errorHandler);

setupGlobalErrorHandlers();

// Server startup
const PORT = getEnv().PORT || 3000;

const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`),
);

setupGracefulShutdown(server);
