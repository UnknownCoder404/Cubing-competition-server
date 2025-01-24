import express from "express";
import User from "../../Models/user";
const router = express.Router();
// Route handler for getting live solves
router.get("/", async (req, res) => {
    try {
        const lastUpdated = new Intl.DateTimeFormat("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Europe/Zagreb",
        }).format(new Date());
        const users = await User.find({}, "").select("-role -password -__v");
        users.filter((user) => {
            return user.competitions.length > 0;
        });
        res.status(200).json({
            lastUpdated,
            users,
        });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Greška prilikom dohvaćanja slaganja.",
        });
        return;
    }
});
export default router;
