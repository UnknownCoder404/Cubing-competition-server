import { Cell, Workbook, Worksheet } from "exceljs";
import formatTime from "../../functions/formatTime";
import { IUserDocument } from "../../types/user";
import {
    ICompetitionDocument,
    ICompetitionEvent,
} from "../../types/competition";

// --- HELPER FUNCTIONS FOR CALCULATIONS ---

/**
 * Calculates the best time from an array of attempts.
 * Returns the formatted time or "DNF" if there are no valid times.
 * 0 is treated as DNF.
 */
function calculateBestSolve(solves: number[]): string {
    const validSolves = solves.filter((solve) => solve > 0);
    if (validSolves.length === 0) {
        return "DNF";
    }
    const best = Math.min(...validSolves);
    return formatTime(best);
}

export function getAverageNoFormat(solves: number[]) {
    if (solves.length !== 5) {
        return -1;
    }
    const sortedSolves = solves.slice();
    sortedSolves.sort((a, b) => {
        if (a === 0 && b === 0) return 0;
        if (a === 0) return 1;
        if (b === 0) return -1;
        return a - b;
    });
    const trimmedSolves = sortedSolves.slice(1, sortedSolves.length - 1);
    const average =
        trimmedSolves.reduce((acc, val) => acc + val, 0) / trimmedSolves.length;
    if (trimmedSolves.includes(0)) {
        return 0;
    }
    return average.toFixed(2);
}

export function getAverage(solves: number[] | undefined): string {
    if (!solves) return "Potrebno 5 slaganja";
    const noFormatAverage = getAverageNoFormat(solves);
    if (typeof noFormatAverage === "string") {
        const avgNum = parseFloat(noFormatAverage);
        return !isNaN(avgNum) ? formatTime(avgNum) : "Greška";
    } else if (noFormatAverage === -1) {
        return "Potrebno 5 slaganja";
    } else {
        return "DNF";
    }
}

// --- MAIN LOGIC ---

async function getResultsInExcel(
    users: IUserDocument[],
    competition: ICompetitionDocument,
): Promise<Workbook> {
    const workbook = new Workbook();
    const compId = competition._id;

    try {
        competition.events.forEach((event) => {
            createWorksheetForEvent(
                workbook,
                event,
                users,
                compId,
                event.rounds,
            );
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
    numberOfRounds: number,
) {
    const worksheet = workbook.addWorksheet(event.name);

    const columnDefinitions = [
        { header: "Ime", key: "name", width: 30 },
        { header: "Grupa", key: "group", width: 10 },
        { header: "Rang", key: "rang", width: 10 },
        { header: "Slaganje 1", key: "solve1", width: 15 },
        { header: "Slaganje 2", key: "solve2", width: 15 },
        { header: "Slaganje 3", key: "solve3", width: 15 },
        { header: "Slaganje 4", key: "solve4", width: 15 },
        { header: "Slaganje 5", key: "solve5", width: 15 },
        { header: "Najbolje", key: "best", width: 15 },
        { header: "Prosjek", key: "ao5", width: 15 },
    ];
    worksheet.columns = columnDefinitions;

    const usersForEvent = filterUsersForEvent(users, compId, event.name);

    for (let roundIndex = 0; roundIndex < numberOfRounds; roundIndex++) {
        const roundNumber = roundIndex + 1;

        const headerRow = worksheet.addRow([]);
        const mergeRange = `A${headerRow.number}:J${headerRow.number}`;
        worksheet.mergeCells(mergeRange);
        const headerCell = headerRow.getCell(1);
        headerCell.value = `Runda ${roundNumber}`;
        headerCell.font = { bold: true, size: 12 };
        headerCell.alignment = { vertical: "middle", horizontal: "center" };

        const roundRows: any[] = [];
        usersForEvent.forEach((user) => {
            const userEventData = getUserEventData(user, compId, event.name);
            const roundSolves = userEventData?.rounds?.[roundIndex];
            if (roundSolves && Array.isArray(roundSolves)) {
                const rowData = createRowForUserRound(
                    user,
                    roundSolves,
                    roundIndex,
                );
                roundRows.push(rowData);
            }
        });

        if (roundRows.length > 0) {
            const groups: { [key: string]: any[] } = {};
            roundRows.forEach((row) => {
                const grp = row.group || "N/D";
                if (!groups[grp]) groups[grp] = [];
                groups[grp].push(row);
            });
            const groupKeys = Object.keys(groups).sort();
            groupKeys.forEach((grp) => {
                const groupRows = groups[grp];
                groupRows.sort((a, b) => a.numericBest - b.numericBest);
                groupRows.forEach((row, idx) => {
                    row.rang = idx + 1;
                    delete row.numericBest;
                });
                const groupHeader = worksheet.addRow([]);
                worksheet.mergeCells(
                    `A${groupHeader.number}:J${groupHeader.number}`,
                );
                groupHeader.getCell(1).value = `Grupa: ${grp}`;
                groupHeader.getCell(1).font = { bold: true };
                groupRows.forEach((row) => {
                    worksheet.addRow(row);
                });
                worksheet.addRow([]);
            });
        } else {
            const noResultsRow = worksheet.addRow([]);
            worksheet.mergeCells(
                `A${noResultsRow.number}:J${noResultsRow.number}`,
            );
            const cell = noResultsRow.getCell(1);
            cell.value = "Nema unesenih rezultata za ovaj krug.";
            cell.font = { italic: true };
            cell.alignment = { horizontal: "center" };
        }

        if (roundIndex < numberOfRounds - 1) {
            worksheet.addRow([]);
        }
    }

    autoSizeColumnsInASheet(worksheet);
}

// Finds the data for a specific user's event within the competition
function getUserEventData(
    user: IUserDocument,
    compId: string,
    eventName: string,
) {
    const comp = user.competitions?.find((comp) =>
        comp.competitionId.equals(compId),
    );
    if (!comp || !comp.events) return null;
    return comp.events.find((event) => event.event === eventName) ?? null;
}

// Filters users who participated in a specific competition event
function filterUsersForEvent(
    users: IUserDocument[],
    compId: string,
    eventName: string,
): IUserDocument[] {
    return users.filter((user) => {
        const comp = user.competitions?.find((comp) =>
            comp.competitionId.equals(compId),
        );
        return comp?.events?.some((event) => event.event === eventName);
    });
}

/**
 * Creates an Excel row object for ONE round of ONE user.
 */
function createRowForUserRound(
    user: IUserDocument,
    roundSolves: number[],
    roundIndex: number,
): Record<string, any> {
    const row: Record<string, any> = {
        name: user.username,
        group: user.group ?? "N/D",
    };

    const validSolves = roundSolves.filter((solve) => solve > 0);
    const numericBest = validSolves.length
        ? Math.min(...validSolves)
        : Infinity;

    for (let i = 0; i < 5; i++) {
        const solve = roundSolves[i];
        if (solve === undefined || solve === null) {
            row[`solve${i + 1}`] = "";
        } else if (solve === 0) {
            row[`solve${i + 1}`] = "DNF";
        } else {
            row[`solve${i + 1}`] = formatTime(solve);
        }
    }

    row.best = numericBest === Infinity ? "DNF" : formatTime(numericBest);
    row.numericBest = numericBest;
    row.ao5 = getAverage(roundSolves);

    return row;
}

// User-provided auto-size function implementation
function autoSizeColumnsInASheet(worksheet: Worksheet) {
    worksheet.columns.forEach((column) => {
        if (!column || !(column.key || column.header)) return;

        let maxLength = 10;
        if (column.eachCell) {
            column.eachCell({ includeEmpty: true }, (cell: Cell) => {
                let cellLength = 0;
                if (cell.value) {
                    const value = cell.value;
                    if (typeof value === "object" && value !== null) {
                        if (
                            "richText" in value &&
                            Array.isArray(value.richText)
                        ) {
                            cellLength = value.richText.reduce(
                                (len, rt) => len + (rt.text?.length ?? 0),
                                0,
                            );
                        } else {
                            cellLength = JSON.stringify(value).length;
                        }
                    } else {
                        cellLength = value.toString().length;
                    }
                }
                maxLength = Math.max(maxLength, cellLength);
            });
            column.width = Math.max(10, maxLength + 1);
        }
    });
}

export default getResultsInExcel;
