import Competition from "../../Models/competition";
import User from "../../Models/user";
// Assuming User and Competition models are defined elsewhere and have Typescript types
// Define types based on your actual User and Competition models
interface UserType {
    _id: any; // Or ObjectId if you are using mongoose.ObjectId
    username: string;
    group: string;
    competitions: CompetitionParticipation[];
}

interface CompetitionParticipation {
    competitionId: any; // Or ObjectId
    events: EventResult[];
}

interface EventResult {
    event: string;
    rounds: number[][]; // solves are numbers
}
interface CompetitionType {
    _id: any; // Or ObjectId
    name: string;
    date: Date | string; // Assuming date can be Date object or string format
    isLocked: boolean;
    events: EventDefinition[];
}

interface EventDefinition {
    name: string;
    rounds: number; // Number of rounds for the event
}

interface Winner {
    userId: any; // Or ObjectId
    average: number;
    username: string;
    solves: number[];
    group: string;
}

type Results = Record<string, CompetitionResult>;

interface CompetitionResult {
    date: Date | string;
    isLocked: boolean;
    events: Record<string, Winner[][]>;
}

function getAverageNoFormat(solves: number[]): number {
    if (solves.length !== 5) {
        return -1;
    }

    // Create a copy of the solves array
    let sortedSolves = [...solves];

    sortedSolves.sort((a, b) => {
        if (a === 0) return 1; // Place 0 at the last element
        if (b === 0) return -1; // Place 0 at the last element
        return a - b; // Regular sorting for other numbers
    });
    // Remove the smallest and largest elements
    let trimmedSolves = sortedSolves.slice(1, sortedSolves.length - 1);

    // Calculate average
    let average =
        trimmedSolves.reduce((acc, val) => acc + val, 0) / trimmedSolves.length;

    // Check if trimmedSolves contains DNF
    if (trimmedSolves.includes(0)) {
        return 0;
    }

    // Return average rounded to 2 decimal places
    return Math.round(average * 100) / 100;
}

function getWinnersFromRound(
    users: UserType[],
    competitionId: any, // Or ObjectId
    eventName: string,
    roundIndex: number,
): Winner[] {
    // Initialize an array to store users with their average
    const usersWithAverages: Winner[] = [];

    users.forEach((user) => {
        // Find the specific competition for this user
        const competition = user.competitions.find(
            (comp) => (comp.competitionId as any).equals(competitionId), // Assuming competitionId is ObjectId and has equals method
        );
        if (!competition) return; // If competition is not found, skip this user

        // Find the specific event within this competition
        const event = competition.events.find((e) => e.event === eventName);
        if (!event) return; // If event is not found, skip this user

        // Get the solves for the current round
        const solves = event.rounds[roundIndex];
        if (!solves) return; // If no solves for this round, skip this user

        // Calculate the average using the getAverageNoFormat function
        const average = getAverageNoFormat(solves);
        if (average === -1 || average === 0) return; // Skip users with invalid averages
        const username = user.username;
        // Push the user with their average to the array
        usersWithAverages.push({
            userId: user._id,
            average: average,
            username: username,
            solves: solves,
            group: user.group,
        });
    });
    // Sort users by average in ascending order (lower average is better)
    usersWithAverages.sort((a, b) => a.average - b.average);

    // Extract userIds in the sorted order
    return usersWithAverages;
}

async function getWinners(
    competitions: CompetitionType[],
    users: UserType[],
    format: boolean = false,
): Promise<Results> {
    const results: Results = {};
    for (const competition of competitions) {
        // const competitionId = competition._id;
        const competitionName = competition.name;
        // Initialize competition result
        results[competitionName] = {
            date: competition.date,
            isLocked: competition.isLocked,
            events: {},
        };
        for (const event of competition.events) {
            // Initialize event result
            results[competitionName].events[event.name] = [];

            for (let i = 0; i < event.rounds; i++) {
                // Get winner for each round
                const winners = getWinnersFromRound(
                    users,
                    competition._id,
                    event.name,
                    i,
                );

                // Append the winners of the round to the event results
                results[competitionName].events[event.name].push(winners);
            }
        }
    }

    // Convert the results to JSON format
    const jsonResults = JSON.stringify(results, null, format ? 2 : 0);
    return results;
}

export async function getWinnersForAllLockedCompetitions(): Promise<Results> {
    // Assuming Competition and User are your mongoose models with proper types
    const competitions = (await Competition.find({
        isLocked: true,
    })) as CompetitionType[];
    const users = (await User.find()) as UserType[];
    const result = await getWinners(competitions, users);
    return result;
}
