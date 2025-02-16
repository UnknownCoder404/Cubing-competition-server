import type { NextFunction, Request, Response } from "express";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== "admin") {
        res.status(401).json({ message: "Samo administratori imaju pristup." });
        return;
    }
    next();
};
export default isAdmin;
