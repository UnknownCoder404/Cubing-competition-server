import type { Request, Response } from "express";
import express from "express";
import User from "../../Models/user";
import loginLimiter from "../../rateLimiter/login";

const router = express.Router();

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
        );

        // Check credentials
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({
                message: "Korisničko ime ili lozinka nisu ispravni.",
            });
            return;
        }

        // Store user data in session
        req.session.user = {
            id: user._id,
            role: user.role,
            username: user.username,
        };

        // Commit the session before sending response
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({
                    message: "Došlo je do pogreške pri prijavi.",
                });
            }

            res.status(200).json({
                message: "Korisnik se uspješno prijavio.",
                info: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                },
            });
        });
    } catch (err) {
        console.error(`Error in login:\n ${err}`);
        res.status(500).json({
            message: "Došlo je do pogreške na poslužitelju.",
        });
    }
});

export default router;
