import express from "express";
import User from "../../Models/user";
import authenticateSession from "../../middleware/authenticateSession";
import isAdmin from "../../utils/helpers/isAdmin";
const router = express.Router();

router.delete("/:userId", authenticateSession, isAdmin, async (req, res) => {
    try {
        const userId = req.params.userId; // Id of user to delete

        // Delete user with this id.
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            res.status(404).json({ message: "Korisnik nije pronađen." });
            return;
        }

        res.status(200).json({ message: "Korisnik je uspješno izbrisan." });
        return;
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: "Greška u serveru." });
    }
});

export default router;
