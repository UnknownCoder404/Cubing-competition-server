import express from "express";
import authenticateSession from "../../middleware/verifyToken";
const router = express.Router();

router.get("/logout", authenticateSession, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error during logout:", err);
            res.status(500).json({
                message: "Error occurred during logout",
            });
            return;
        }

        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logged out successfully" });
    });
});

export default router;
