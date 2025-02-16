import User from "../Models/user";
import { Types } from "mongoose";
import { AllowedEvent } from "../config/allowedEvents";
import { IUserDocument } from "../types/user";
import { ICompetitionDocument } from "../types/competition";

/**
 * Function to update solver's solves in a given competition and round
 * @param {IUserDocument} solver - Mongoose document for the user schema
 * @param {{ event: AllowedEvent, rounds: number[] }} events - Object with event (String) and solves (array)
 * @param {number} round - The round number to add solves to
 * @param {IUserCompetition} competition - Mongoose document for the competition schema
 * @param {boolean} [replace=false] - Whether to replace existing solves in the round
 */
async function updateSolves(
    solver: IUserDocument,
    events: { event: AllowedEvent; rounds: number[] },
    round: number,
    competition: ICompetitionDocument,
    replace: boolean = false,
): Promise<1 | -1> {
    try {
        // Find the user who is the solver
        const user = await User.findById(solver._id);
        if (!user) throw new Error("User not found");
        if (!user.competitions) user.competitions = [];
        console.time("Add solve");
        // Find the competition the user participated in
        let userCompetition = user.competitions.find((comp) =>
            comp.competitionId.equals(competition._id),
        );
        if (!userCompetition) {
            user.competitions.push({
                competitionId: competition._id,
                events: [], // Initialize events array
            } as any); // Type assertion needed as the push might expect the full IUserCompetition
            userCompetition = user.competitions.find((comp) =>
                comp.competitionId.equals(competition._id),
            );
        }

        if (!userCompetition) {
            throw new Error("Could not find or create user competition.");
        }

        // Find the event in the user's competition data
        let userEvent = userCompetition.events.find(
            (event) => event.event === events.event,
        );
        if (!userEvent) {
            // If event doesn't exist, create a new one
            userCompetition.events.push({ event: events.event, rounds: [] });
            userEvent = userCompetition.events.find(
                (event) => event.event === events.event,
            );
        }

        if (!userEvent) {
            throw new Error("Could not find or create user event.");
        }

        // If you add solves to round 2 and there are no solves in round 1, round 1 is undefined and it needs to be replaced
        if (!userEvent.rounds[round - 1]) {
            replace = true;
        }
        // Add the new solves to the specified round
        if (replace) {
            userEvent.rounds[round - 1] = events.rounds;
        } else {
            if (!userEvent.rounds[round - 1]) {
                userEvent.rounds[round - 1] = []; // Initialize the array if it's undefined
            }
            userEvent.rounds[round - 1].push(...events.rounds);
        }
        if (userEvent.rounds[round - 1].length > 5) {
            userEvent.rounds[round - 1] = userEvent.rounds[round - 1].slice(
                0,
                5,
            );
        }
        console.timeEnd("Add solve");
        // Save the updated user data
        await user.save();
        console.log("Solves updated successfully");
        return 1;
    } catch (error) {
        console.error("Error updating solves:", error);
        return -1;
    }
}

export default updateSolves;
