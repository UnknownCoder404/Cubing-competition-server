import { Request, Response, NextFunction } from "express";

export const sessionErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Check if this is a MongoStore session error about not finding the session
    if (
        err &&
        err.message &&
        err.message.includes("Unable to find the session to touch")
    ) {
        // This is expected when sessions are invalidated
        console.log(
            "Note: Session was invalidated during this request - this is expected behavior",
        );

        // If the response hasn't been sent yet, continue
        if (!res.headersSent) {
            return next();
        }
        // Otherwise, the error can be safely ignored
        return;
    }

    // For any other errors, pass to the next error handler
    next(err);
};
