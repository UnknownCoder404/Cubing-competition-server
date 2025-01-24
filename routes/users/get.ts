import express from "express";
import { getUserById } from "../../functions/getUserById";
const router = express.Router();
router.get("/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            res.status(400).json({
                message: "Nema ID korisnika.",
            });
            return;
        }
        // Fetch all users from the database
        const user = await getUserById(userId, "username competitions");

        // Send the response array
        res.status(200).json(user);
    } catch (error: unknown) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: "Greška u serveru." });
    }
});
export default router;
