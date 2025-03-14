import express from "express";
import User from "../../Models/user";
import verifyToken from "../../middleware/authenticateSession";
import hashPassword from "../../functions/hashPassword";
const router = express.Router();
import isAdmin from "../../utils/helpers/isAdmin";
import {
    checkUsernameAndPassword,
    checkPasswordLength,
    checkUsernameAndPasswordEquality,
    checkPasswordSpaces,
} from "../../functions/registerValidations";

router.post("/change-password", verifyToken, isAdmin, async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        const user = await User.findOne({ username: { $eq: username } });
        if (!user) {
            res.status(400).json({
                message: `Korisnik sa imenom ${username} ne postoji.`,
            });
            return;
        }
        checkUsernameAndPassword(user.username, newPassword, res);
        checkUsernameAndPasswordEquality(user.username, newPassword, res);
        checkPasswordLength(newPassword, res);
        checkPasswordSpaces(newPassword, res);
        user.password = await hashPassword(newPassword);
        await user.save();
        res.status(200).json({ message: "Lozinka promijenjena." });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Greška kod servera." });
    }
});

export default router;
