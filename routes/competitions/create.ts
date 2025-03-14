import express from "express";
const router = express.Router();
import Competition from "../../Models/competition";
import allowedEvents, { type AllowedEvent } from "../../config/allowedEvents";
import isAdmin from "../../utils/helpers/isAdmin";
import verifyToken from "../../middleware/authenticateSession";

// Define a more specific type for the event object within RequestBody
type EventType = {
    name: AllowedEvent;
    rounds: number;
    solvers?: any[]; // Consider defining a more specific type for solvers if possible, e.g., UserID[] or SolverObject[]
};

// Improve RequestBody type to use the more specific EventType
type RequestBody = {
    events: EventType[];
    name: string;
    date: string;
};

router.post(
    "/create",
    verifyToken,
    isAdmin,
    async (
        req: express.Request<{}, {}, RequestBody>, // Type the request body
        res: express.Response,
    ) => {
        const { events, name, date } = req.body;

        if (!events || !name || !date) {
            res.status(400).json({
                message: "Eventovi, ime i datum su obavezni.",
            });
            return;
        }

        for (let i = 0; i < events.length; i++) {
            // Use a for loop for proper type inference and early return
            const event = events[i];
            if (!event.name || !event.rounds) {
                res.status(400).json({
                    message: `Ime i broj runda su obavezni. (#${i + 1})`,
                });
                return;
            }
            if (!allowedEvents.includes(event.name)) {
                res.status(400).json({
                    message: `Event "${event.name}" nije dozvoljen. (#${
                        i + 1
                    })`,
                });
                return;
            }
        }

        // event.solvers can be undefined, that means that solvers will be empty array
        const newCompetitionEvents = events.map((event): EventType => {
            // Explicitly type the map result and callback
            return {
                name: event.name,
                rounds: event.rounds,
                solvers: event.solvers || [],
            };
        });

        try {
            const newCompetition = new Competition({
                name: name,
                events: newCompetitionEvents,
                date: date,
            });
            await newCompetition.save();
            res.status(200).json({ message: "Natjecanje napravljeno." });
            return;
        } catch (error: any) {
            // Type error as any or Error
            if (error.code === 11000) {
                res.status(409).json({
                    message: "Ime natjecanja je već korišteno.",
                });
                return;
            }
            console.error(error);
            res.status(500).json({
                message: "Greška prilikom izrade natjecanja.",
            });
            return;
        }
    },
);

export default router;
