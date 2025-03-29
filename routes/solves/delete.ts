import express from "express";
import mongoose from "mongoose";
import allowedEvents, { AllowedEvent } from "../../config/allowedEvents";
import authenticateSession from "../../middleware/authenticateSession";
import { getUserById } from "../../functions/getUserById";
import { getCompetitionById } from "../../functions/getCompetitionById";
import isAdmin from "../../middleware/isAdmin";
import { IUserDocument } from "../../types/user";

const router = express.Router();

interface DeleteSolveResult {
    status?: number;
    success?: boolean;
    message?: string;
}

router.delete("/:userId", authenticateSession, isAdmin, async (req, res) => {
    try {
        const userId = req.params.userId;
        const compToDelete = req.body.competitionId;
        const eventToDelete = req.body.event;
        const roundToDelete = req.body.round;
        const solveToDelete = req.body.solve;

        // Type-safe check
        if (
            typeof roundToDelete !== "number" ||
            typeof solveToDelete !== "number" ||
            !allowedEvents.includes(eventToDelete) ||
            !mongoose.Types.ObjectId.isValid(compToDelete)
        ) {
            res.status(400).json({ message: "Invalid input types." }); // More generic error message here
            return;
        }
        const competition = await getCompetitionById(compToDelete);
        if (!competition) {
            res.status(400).json({
                message: `Natjecanje s tim ID-om nije pronađeno. ( Naveli ste: ${compToDelete} )`,
            });
            return;
        }
        if (competition.isLocked) {
            res.status(403).json({
                message: "Natjecanje je zavrešeno i ne mogu se izbrisati.",
            });
            return;
        }
        const user = await getUserById(userId);
        if (!user) {
            res.status(400).json({
                message: `Korisnik s tim ID-om nije pronađen. ( Naveli ste: ${userId} )`,
            });
            return;
        }

        const result = await deleteSolve(
            user,
            compToDelete,
            eventToDelete,
            roundToDelete,
            solveToDelete,
        );

        if (result && !result.success) {
            // Check if result is defined and not successful
            // Handle the unsuccessful case appropriately. Throwing an error here might not be the best approach,
            // depending on how you want to handle error responses.
            console.error("Error deleting solve:", result.message);
            res.status(result.status || 500).json({
                message: result.message || "Failed to delete solve.",
            });
            return;
        }

        await user.save();
        res.status(result?.status || 200).json({
            message: result?.message || "Uspješno izbrisano.",
        });
        return;
    } catch (err: any) {
        // Explicitly type err as any
        console.error(`Error deleting solve:\n ${err}`);
        res.status(err?.status || 500).json({
            message: err?.message || "Neuspjelo brisanje. Greška u serveru.",
        });
    }
});

async function deleteSolve(
    user: IUserDocument,
    competitionId: string,
    eventName: AllowedEvent,
    roundNumber: number,
    solveNumber: number,
): Promise<DeleteSolveResult> {
    try {
        if (!user.competitions) {
            user.competitions = [];
        }
        const comp = user.competitions.find((userComp) => {
            return userComp.competitionId.equals(competitionId);
        });
        if (!comp) {
            return {
                status: 400,
                message: `Natjecanje s tim ID-om na tom korisniku nije pronađeno. ( Naveli ste: compId: ${competitionId}, userId: ${user._id} )`,
            };
        }
        const eventToDelete = comp.events.find((event) => {
            return event.event === eventName;
        });
        if (!eventToDelete) {
            return {
                status: 400,
                message: `Event "${eventName}" nije pronađen u natjecanju s ID-om ${competitionId} u korisniku ${user._id}.`,
            };
        }
        let roundToDelete = eventToDelete.rounds[roundNumber - 1];
        if (!roundToDelete) {
            return {
                status: 400,
                message: `Runda ${roundNumber} u natjecanju s ID-om "${competitionId}" u korisniku "${user._id}" u eventu "${eventName}" nije pronađena.`,
            };
        }

        const solveIndex = solveNumber - 1;
        roundToDelete.splice(solveIndex, 1);
        await user.save();
        return {
            status: 200,
            success: true,
            message: `Uspješno izbrisano.`,
        };
    } catch (error) {
        console.error(`Error deleting solve:\n ${error}`);
        return {
            status: 500,
            message: `Neuspjelo brisanje. Greška u serveru.`,
        };
    }
}

export default router;
