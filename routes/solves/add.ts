import express from "express";
import mongoose from "mongoose";
import Competition from "../../Models/competition";
import authenticateSession from "../../middleware/authenticateSession";
import updateSolves from "../../functions/addSolves";
import { getUserById } from "../../functions/getUserById";
import isAdmin from "../../middleware/isAdmin";

const router = express.Router();

router.post("/:solverId", authenticateSession, isAdmin, async (req, res) => {
    try {
        const { solverId } = req.params;
        const solver = await getUserById(solverId);
        // const judgeId = req.userId;
        const { solves, round, competitionId } = req.body;

        if (!solver) {
            res.status(400).json({
                message: `Natjecatelj ne postoji. (Naveli ste: ${solverId})`,
            });
            return;
        }

        if (!solves) {
            res.status(400).json({ message: "Nema ponuđenih slaganja." });
            return;
        }

        if (!competitionId) {
            res.status(400).json({ message: "Nema ID natjecanja." });
            return;
        }

        // Validate competitionId
        if (!mongoose.Types.ObjectId.isValid(competitionId)) {
            res.status(400).json({ message: "ID natjecanja nije ispravan." });
            return;
        }

        const competition = await Competition.findById(competitionId);
        if (!competition) {
            res.status(400).json({
                message: `Natjecanje ne postoji. (Id: ${competitionId})`,
            });
            return;
        }

        if (competition.isLocked) {
            res.status(403).json({
                message:
                    "Natjecanje je zavrešeno i ne mogu se dodati slaganja.",
            });
            return;
        }

        const response = await updateSolves(solver, solves, round, competition);

        if (response > 0) {
            res.status(200).json({
                message: `Slaganje dodano korisniku ${solver.username}.`,
            });
            return;
        }

        throw new Error(
            `Nije uspjelo dodavanje slaganja. Kod greške: ${response}`,
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Neuspjelo dodavanje slaganja. Greška u serveru.",
        });
        return;
    }
});

export default router;
