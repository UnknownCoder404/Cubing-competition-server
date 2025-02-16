import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import getEnv from "../utils/getEnv";
import { TokenPayload } from "../types/token";

// Define a middleware to verify the token
async function verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
        // Get the token from the request header or from parameters in the URL
        const token = req.headers["authorization"]
            ? req.headers["authorization"].replace(/^Bearer\s/, "")
            : new URLSearchParams(req.url.split("?")[1]).get("token");
        // Check if the token exists
        if (!token) {
            res.status(403).json({
                message: "Nema tokena. Prijavi se ponovno.",
            });
            return;
        }
        // Verify the token with the secret key
        const decoded = jwt.verify(token, getEnv().JWT_SECRET) as TokenPayload;
        // Set the user id to the request object
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // Call the next middleware
        next();
    } catch (err) {
        res.status(401).json({
            message: "Pogrešan token. Pokušajte se ponovno prijaviti.",
        });
    }
}
export default verifyToken;
