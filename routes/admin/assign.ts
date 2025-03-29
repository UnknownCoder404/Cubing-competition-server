import express from "express";
import User from "../../Models/user";
import authenticateSession from "../../middleware/authenticateSession";
import isAdmin from "../../middleware/isAdmin";

const router = express.Router();

router.post("/:userId", authenticateSession, isAdmin, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findOne({ _id: { $eq: userId } });
        if (!user) {
            res.status(404).json({ message: "Korisnik nije pronađen." });
            return;
        }
        if (user.role === "admin") {
            // If user is already admin, remove admin
            const users = await User.find({}, "role");
            let adminsCount = 0;
            users.forEach((user) => {
                adminsCount += user.role === "admin" ? 1 : 0;
            });
            if (adminsCount <= 1) {
                res.status(400).json({
                    message: "Uvijek mora postojati barem 1 administrator.",
                });
                return;
            }
            user.role = "user";
            await user.save();
            res.status(200).json({
                message: `Uloga administratora ${user.username} uspješno je odbačena.`,
            });
            return;
        }
        user.role = "admin";
        await user.save();
        res.status(200).json({
            message: "Uloga administratora uspješno je dodijeljena.",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Greška pri serveru." });
    }
});
export default router;
