import type { NextFunction, Request, Response } from "express";

// Updated session-based authentication middleware
function authenticateSession(req: Request, res: Response, next: NextFunction) {
    try {
        // Check if user exists in session
        if (!req.session.user) {
            res.status(401).json({
                message: "Niste prijavljeni. Prijavite se ponovno.",
            });
            return;
        }

        // For backward compatibility with existing routes
        // Consider deprecating these in favor of direct session access
        req.userId = req.session.user.id;
        req.userRole = req.session.user.role;

        // Optional: Add user object to request
        req.user = {
            id: req.session.user.id,
            role: req.session.user.role,
            username: req.session.user.username,
        };

        next();
    } catch (err) {
        console.error("Session authentication error:", err);
        res.status(500).json({
            message: "Došlo je do pogreške pri provjeri autentičnosti.",
        });
    }
}

export default authenticateSession;
