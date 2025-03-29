import express from "express";
import hashPassword from "../../functions/hashPassword";
import User from "../../Models/user";
import authenticateSession from "../../middleware/authenticateSession";
import isAdmin from "../../middleware/isAdmin";
import {
    checkUsernameAndPassword,
    checkUsernameLength,
    checkPasswordLength,
    checkUsernameAndPasswordEquality,
    checkGroup,
    checkPasswordSpaces,
} from "../../functions/registerValidations";
import registerLimiter from "../../rateLimiter/register";
const router = express.Router();
// Define a route for user registration
router.post(
    "/register",
    registerLimiter,
    authenticateSession,
    isAdmin,
    async (req, res) => {
        try {
            const { username, password, group } = req.body;
            // Call validation functions and check if response was sent
            // Array of validation functions to execute sequentially
            const validations = [
                () => checkUsernameAndPassword(username, password, res),
                () => checkUsernameLength(username, res),
                () => checkPasswordLength(password, res),
                () => checkUsernameAndPasswordEquality(username, password, res),
                () => checkGroup(group, res),
                () => checkPasswordSpaces(password, res),
            ] as const;

            // Execute validations and check for early returns
            for (const validate of validations) {
                validate();
                if (res.headersSent) return;
            }

            // If all validations pass, proceed with user registration
            const user = new User({
                username,
                password: await hashPassword(password),
                role: "user",
                group,
            });
            await user.save();

            res.status(201).json({
                message: "Korisnik uspješno registriran.",
                registeredUser: {
                    username,
                    password,
                    group,
                },
            });
        } catch (err) {
            if (err instanceof Error) {
                if ("code" in err && (err as any).code === 11000) {
                    res.status(409).json({
                        message: "Korisničko ime već postoji.",
                    });
                    return;
                }
                console.error(`Failed to register user:\n ${err.message}`);
                res.status(500).json({
                    message: "Došlo je do pogreške kod servera.",
                });
                return;
            }
            console.error("Nepoznata greška prilikom registracije:", err);
            res.status(500).json({
                message: "Došlo je do neočekivane pogreške.",
            });
        }
    },
);
export default router;
