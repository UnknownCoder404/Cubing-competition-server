import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    if (req.session.user) {
        res.json({
            isValid: true,
            user: req.session.user,
            expiresAt: req.session.cookie.expires,
        });
        return;
    }
    res.status(401).json({
        isValid: false,
        message: "Session expired or invalid",
    });
});

export default router;
