import express from "express";
import User from "../../Models/user";
import { getCompetitionById } from "../../functions/getCompetitionById";
import getResultsInExcel from "../excel/results-controller"; // Using the existing controller
import authenticateSession from "../../middleware/authenticateSession";
import isAdmin from "../../middleware/isAdmin";

const router = express.Router();
router.get("/:id/results", authenticateSession, isAdmin, async (req, res) => {
    try {
        const competitionId = req.params.id;

        if (!competitionId) {
            res.status(400).json({ message: "Competition id not provided." });
            return;
        }
        const users = await User.find();
        const competition = await getCompetitionById(competitionId);
        if (!competition) {
            res.status(404).json({ message: "Competition not found." });
            return;
        }
        const fileName = competition.name + ".xlsx";
        const workbook = await getResultsInExcel(users, competition);
        // Set the headers to prompt download on the client side
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${fileName}`,
        );
        // Pipe the workbook to the response
        console.time("Send workbook");
        workbook.xlsx.write(res).then(() => {
            console.timeEnd("Send workbook");
            res.end();
        });
    } catch (error) {
        console.error("Failed to generate results in excel format:");
        console.error(error);
        res.status(500).send("Server Error");
    }
});

export default router;
