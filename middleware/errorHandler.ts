import express from "express";

export const errorHandler = (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal server error",
        message:
            process.env.NODE_ENV === "production" ? undefined : err.message,
    });
};
