const { Workbook } = require("exceljs");
const User = require("../../Models/user");
const Competition = require("../../Models/competition");
const formatTime = require("../../functions/formatTime");

/**
 * Generate an Excel workbook with competition results
 * @param {User[]} users - All users in the database
 * @param {Competition} competition - Competition to generate results for
 * @returns {Workbook} Excel workbook with competition results
 */
async function getResultsInExcel(users, competition) {
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

/**
 * Create a worksheet for a specific event
 * @param {Workbook} workbook - Excel workbook to add worksheet to
 * @param {Object} event - Event details
 * @param {User[]} users - All users
 * @param {ObjectId} compId - Competition ID
 * @returns {Worksheet} Created and populated worksheet
 */
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

/**
 * Find user's data for a specific competition and event
 * @param {User} user - User to find data for
 * @param {ObjectId} compId - Competition ID
 * @param {string} eventName - Event name
 * @returns {Object|null} User's event data or null
 */
function getUserEventData(user, compId, eventName) {
    const comp = user.competitions.find((comp) =>
        comp.competitionId.equals(compId),
    );
    if (!comp) return null;

    return comp.events.find((event) => event.event === eventName);
}

/**
 * Filter users participating in a specific event
 * @param {User[]} users - All users
 * @param {ObjectId} compId - Competition ID
 * @param {string} eventName - Event name
 * @returns {User[]} Filtered users for the event
 */
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

/**
 * Create a row of data for a user in an event
 * @param {User} user - User to create row for
 * @param {Object} userEventData - User's event data
 * @returns {Object} Row data for the worksheet
 */
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

/**
 * Automatically resize columns in a worksheet based on content
 * @param {Worksheet} worksheet - Worksheet to auto-size
 * @returns {Worksheet} Worksheet with auto-sized columns
 */
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

module.exports = getResultsInExcel;
