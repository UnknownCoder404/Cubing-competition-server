export const setupGlobalErrorHandlers = () => {
    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason: any) => {
        console.error("Unhandled Rejection:", reason);
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
        console.error("Uncaught Exception:", error);
        process.exit(1);
    });
};
