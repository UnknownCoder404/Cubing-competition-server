import { Workbook } from "exceljs";
import formatTime from "../../functions/formatTime";
import { IUserDocument } from "../../types/user";
import {
    ICompetitionDocument,
    ICompetitionEvent,
} from "../../types/competition";

async function getResultsInExcel(
    users: IUserDocument[],
    competition: ICompetitionDocument,
): Promise<Workbook> {
    const workbook = new Workbook();
    const compId = competition._id;

    try {
        // Process each event in the competition
        competition.events.forEach((event) => {
            createWorksheetForEvent(workbook, event, users, compId);
        });

        return workbook;
    } catch (error) {
        console.error("Error generating Excel results:", error);
        throw error;
    }
}

function createWorksheetForEvent(
    workbook: Workbook,
    event: ICompetitionEvent,
    users: IUserDocument[],
    compId: string,
) {
    // Create worksheet columns
    const rounds = Array.from({ length: event.rounds }, (_, i) => ({
        header: `Runda ${i + 1}`,
        key: `round${i + 1}`,
        width: 30,
    }));

    // Create worksheet
    const worksheet = workbook.addWorksheet(event.name);
    worksheet.columns = [{ header: "Ime", key: "name", width: 50 }, ...rounds];

    // Filter and add users for this event
    const usersForEvent = filterUsersForEvent(users, compId, event.name);

    usersForEvent.forEach((user) => {
        const userEventData = getUserEventData(user, compId, event.name);
        if (!userEventData) return;

        const row = createRowForUser(user, userEventData);
        worksheet.addRow(row);
    });

    // Auto-size columns
    return autoSizeColumnsInASheet(worksheet);
}

function getUserEventData(
    user: IUserDocument,
    compId: string,
    eventName: string,
) {
    const comp = user.competitions.find((comp) =>
        comp.competitionId.equals(compId),
    );
    if (!comp) return null;

    return comp.events.find((event) => event.event === eventName);
}

function filterUsersForEvent(
    users: IUserDocument[],
    compId: string,
    eventName: string,
): IUserDocument[] {
    const filteredUsers = users.filter((user) => {
        const comp = user.competitions.find((comp) =>
            comp.competitionId.equals(compId),
        );
        return comp && comp.events.some((event) => event.event === eventName);
    });

    console.log(`${filteredUsers.length} users found for event ${eventName}`);
    return filteredUsers;
}

function createRowForUser(
    user: IUserDocument,
    userEventData: { rounds: number[][] },
) {
    const row: Record<string, string> = { name: user.username };

    userEventData.rounds.forEach((round, index) => {
        if (!round || round.length === 0) return;

        const formattedSolves = round.map((solve) =>
            solve === 0 ? "DNF" : formatTime(solve),
        );

        row[`round${index + 1}`] = formattedSolves.join(", ");
    });

    return row;
}

function autoSizeColumnsInASheet(worksheet: any) {
    worksheet.columns.forEach((column: any) => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = cell.value ? cell.value.toString().length : 10;
            maxLength = Math.max(maxLength, cellLength);
        });
        column.width = maxLength;
    });
    return worksheet;
}

export default getResultsInExcel;
