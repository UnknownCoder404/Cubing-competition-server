import express from "express";
import Competition from "../../Models/competition";
import isAdmin from "../../utils/helpers/isAdmin";
import verifyToken from "../../middleware/authenticateSession";
import { AllowedEvent } from "../../config/allowedEvents";

const router = express.Router();

interface EventType {
    name: AllowedEvent;
    rounds: number;
    solvers?: any[]; // Adjust type if you have a better definition for solvers
}

interface UpdateCompetitionRequestBody {
    name?: string; // Optional as per validation logic
    date?: string; // Optional as per validation logic
    events?: EventType[]; // Optional as per validation logic
}

interface ValidationResult {
    isValid: boolean;
    message?: string; // Message is optional, only present when isValid is false
}

// Type the validateRequest function
function validateRequest(
    id: string | undefined,
    name: any,
    date: any,
    events: any,
): ValidationResult {
    if (!id || typeof id !== "string") {
        return { isValid: false, message: "ID je krivo unesen ili nedostaje." };
    }
    if (name !== undefined && typeof name !== "string") {
        // Check for undefined to allow optional fields
        return {
            isValid: false,
            message: "Naziv je krivo unesen ili nedostaje.",
        };
    }
    if (date !== undefined && typeof date !== "string") {
        // Check for undefined to allow optional fields
        return {
            isValid: false,
            message: "Datum je krivo unesen ili nedostaje.",
        };
    }
    if (events !== undefined && !Array.isArray(events)) {
        // Check if events is array and not just object
        return {
            isValid: false,
            message: "Događaji su krivo uneseni ili nedostaju.",
        };
    }
    if (events) {
        // If events is provided and is array, validate each event object structure
        for (const event of events) {
            if (
                typeof event !== "object" ||
                !event ||
                typeof event.name !== "string" ||
                typeof event.rounds !== "number"
            ) {
                return {
                    isValid: false,
                    message:
                        "Događaji su krivo uneseni. Provjerite format događaja (name: string, rounds: number).",
                };
            }
            // You can add more specific validations for event properties if needed
        }
    }
    return { isValid: true };
}

router.put(
    "/:id",
    verifyToken,
    isAdmin,
    async (req: express.Request, res: express.Response) => {
        const { id } = req.params;
        const { name, date, events } = req.body;

        const requesValidation = validateRequest(id, name, date, events);
        if (!requesValidation.isValid) {
            res.status(400).json({ message: requesValidation.message });
            return;
        }

        try {
            const competition: any = await Competition.findById(id); // Type competition, ideally use a proper Competition model type
            if (!competition) {
                res.status(404).json({ message: "Natjecanje ne postoji." });
                return;
            }
            if (competition.isLocked) {
                res.status(403).json({
                    message:
                        "Natjecanje je zaključano i ne može se izmijeniti.",
                });
                return;
            }

            if (name !== undefined) competition.name = name; // Only update if provided
            if (date !== undefined) competition.date = date; // Only update if provided
            if (events !== undefined) competition.events = events; // Only update if provided

            await competition.save();
            res.status(200).json({ message: "Natjecanje je izmenjeno." });
            return;
        } catch (err: any) {
            // Type err as any or Error
            console.error(err);
            res.status(500).json({
                message: "Greška prilikom izmenu natjecanja",
            });
            return;
        }
    },
);

export default router;
