import express from "express";
import User from "../../Models/user";
import authenticateSession from "../../middleware/authenticateSession";
import hashPassword from "../../functions/hashPassword";
const router = express.Router();
import isAdmin from "../../middleware/isAdmin";
import {
    checkUsernameAndPassword,
    checkPasswordLength,
    checkUsernameAndPasswordEquality,
    checkPasswordSpaces,
} from "../../functions/registerValidations";
import { invalidateSessions } from "../../utils/invalidateSessions";

router.put(
    "/:userId/password",
    authenticateSession,
    isAdmin,
    async (req, res) => {
        try {
            const { userId } = req.params;
            const { newPassword } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({
                    message: `Korisnik ne postoji.`,
                });
                return;
            }

            checkUsernameAndPassword(user.username, newPassword, res);
            checkUsernameAndPasswordEquality(user.username, newPassword, res);
            checkPasswordLength(newPassword, res);
            checkPasswordSpaces(newPassword, res);
            if (res.headersSent) {
                return;
            }

            // Change password
            user.password = await hashPassword(newPassword);
            await user.save();

            // Delete all sessions for this user
            await invalidateSessions(userId);

            res.status(200).json({
                message: "Lozinka promijenjena i sve sesije poništene.",
            });
            return;
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Greška kod servera." });
        }
    },
);

export default router;
