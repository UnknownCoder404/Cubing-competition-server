import Competition from "../../Models/competition";
import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const competitions = await Competition.find({});
        res.status(200).json(competitions);
        return;
    } catch (error) {
        res.status(500).json({
            message: "Greška prilikom dohvaćanja natjecanja.",
        });
        return;
    }
});

export default router;
