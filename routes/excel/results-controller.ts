import { Workbook } from "exceljs";
import User from "../../Models/user";
import Competition from "../../Models/competition";
import formatTime from "../../functions/formatTime";

async function getResultsInExcel(users: any, competition: any) {
    const workbook = new Workbook();
    const compId = competition._id;

    try {
        // Process each event in the competition
        competition.events.forEach((event) => {
            const worksheet = createWorksheetForEvent(
                workbook,
                event,
                users,
                compId,
            );
        });

        return workbook;
    } catch (error) {
        console.error("Error generating Excel results:", error);
        throw error;
    }
}

function createWorksheetForEvent(workbook, event, users, compId) {
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

function getUserEventData(user, compId, eventName) {
    const comp = user.competitions.find((comp) =>
        comp.competitionId.equals(compId),
    );
    if (!comp) return null;

    return comp.events.find((event) => event.event === eventName);
}

function filterUsersForEvent(users, compId, eventName) {
    const filteredUsers = users.filter((user) => {
        const comp = user.competitions.find((comp) =>
            comp.competitionId.equals(compId),
        );
        return comp && comp.events.some((event) => event.event === eventName);
    });

    console.log(`${filteredUsers.length} users found for event ${eventName}`);
    return filteredUsers;
}

function createRowForUser(user, userEventData) {
    const row = { name: user.username };

    userEventData.rounds.forEach((round, index) => {
        if (!round || round.length === 0) return;

        const formattedSolves = round.map((solve) =>
            solve === 0 ? "DNF" : formatTime(solve),
        );

        row[`round${index + 1}`] = formattedSolves.join(", ");
    });

    return row;
}

function autoSizeColumnsInASheet(worksheet) {
    worksheet.columns.forEach((column) => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, (cell) => {
            const cellLength = cell.value ? cell.value.toString().length : 10;
            maxLength = Math.max(maxLength, cellLength);
        });
        column.width = maxLength;
    });
    return worksheet;
}

export default getResultsInExcel;
