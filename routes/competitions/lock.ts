import express from "express";
const router = express.Router();
import { getCompetitionById } from "../../functions/getCompetitionById";
import authenticateSession from "../../middleware/authenticateSession";
import isAdmin from "../../middleware/isAdmin";

router.post("/:id/lock", authenticateSession, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "ID je krivo unesen." });
            return;
        }
        const competition = await getCompetitionById(id);
        if (!competition) {
            res.status(404).json({ message: "Natjecanje ne postoji." });
            return;
        }
        competition.isLocked = !competition.isLocked;
        await competition.save();
        if (competition.isLocked) {
            res.status(200).json({ message: "Natjecanje je zaključano." });
            return;
        }
        res.status(200).json({ message: "Natjecanje je otključano." });
        return;
    } catch (error) {
        console.error("Error locking competition: \n", error);
        res.status(500).json({
            message: "Greška prilikom zaključavanja natjecanja.",
        });
        return;
    }
});

export default router;
