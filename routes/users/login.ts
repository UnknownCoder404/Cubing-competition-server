import type { Request, Response } from "express";
import { TokenPayload } from "../../types/token";

import express from "express";
const router = express.Router();
import User from "../../Models/user";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import loginLimiter from "../../rateLimiter/login";
import getEnv from "../../utils/getEnv";
dotenv.config();

router.post("/", loginLimiter, async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // Validate the input
        if (!username || !password) {
            res.status(400).json({
                message: "Korisničko ime i lozinka su obavezni.",
            });
            return;
        }

        // Find the user by username
        const user = await User.findOne({ username: { $eq: username } }).select(
            "+password",
        ); // Select the password field only

        // Check if the user exists and the password matches
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({
                message: "Korisničko ime ili lozinka nisu ispravni.",
            });
            return;
        }
        const tokenPayload: TokenPayload = {
            id: user._id,
            role: user.role,
        } as const;
        // Generate a JSON web token with the user id as the payload
        const token = jwt.sign(tokenPayload, getEnv().JWT_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRATION || "1d",
        });

        res.status(200).json({
            message: "Korisnik se uspješno prijavio.",
            info: { id: user._id, token, username: username, role: user.role },
        });
    } catch (err) {
        // Log the error for internal debugging, but don't expose details to the client
        console.error(`Error in login:\n ${err}`);
        res.status(500).json({
            message: "Došlo je do pogreške na poslužitelju.",
        });
    }
});

export default router;
