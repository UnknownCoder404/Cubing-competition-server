import mongoose from "mongoose";
import { Server } from "http";

export const setupGracefulShutdown = (server: Server) => {
    const gracefulShutdown = () => {
        console.log("Starting graceful shutdown...");
        server.close(async () => {
            console.log("Server closed");
            try {
                await mongoose.disconnect();
                console.log("MongoDB connection closed");
                process.exit(0);
            } catch (error) {
                console.error("Error during shutdown:", error);
                process.exit(1);
            }
        });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
};
