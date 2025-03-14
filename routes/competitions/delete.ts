import express from "express";
import Competition from "../../Models/competition";
import isAdmin from "../../utils/helpers/isAdmin";
import verifyToken from "../../middleware/authenticateSession";
const router = express.Router();

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
        res.status(400).json({ message: "ID je krivo unesen ili nedostaje." });
        return;
    }
    try {
        const competition = await Competition.findById(id);
        if (!competition) {
            res.status(404).json({ message: "Natjecanje ne postoji." });
            return;
        }
        if (competition.isLocked) {
            res.status(403).json({
                message: "Natjecanje je zaključano i ne može se izbrisati.",
            });
            return;
        }
        await competition.deleteOne();
        res.status(200).json({ message: "Natjecanje je izbrisano." });
        return;
    } catch (err) {
        console.error("Error deleting competition: \n", err);
        res.status(500).json({
            message: "Greška prilikom brisanja natjecanja",
        });
        return;
    }
});

export default router;
