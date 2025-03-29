import type { NextFunction, Request, Response } from "express";
import User from "../Models/user";

async function findUser(req: Request, res: Response, next: NextFunction) {
    try {
        // Finds user by req.userId value
        const userId = req.userId;
        const user = await User.findOne({ _id: { $eq: userId } });
        if (!user) {
            res.status(404).json({ message: "Korisnik nije pronađen." });
            return;
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Greška pri serveru." });
        return;
    }
}
export default findUser;
