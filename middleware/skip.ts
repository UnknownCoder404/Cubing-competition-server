import { Request, Response, NextFunction } from "express";

// This is a middleware function which skips to next function in the chain
// It is usually used when something like rate limiting or cors is disabled
// It doesn't do anything but pass the request to the next function
const skip = (_req: Request, _res: Response, next: NextFunction): void => {
    next();
};

export default skip;
