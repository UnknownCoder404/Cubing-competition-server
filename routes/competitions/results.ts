import express from "express";
const router = express.Router();
import { getWinnersForAllLockedCompetitions } from "../../utils/helpers/getWinners";

router.get("/results", async (req, res) => {
    const results = await getWinnersForAllLockedCompetitions();
    res.status(200).json(results);
    return;
});

export default router;
