import express from "express";
import mongoose from "mongoose";
import Post from "../../Models/post";
import verifyToken from "../../middleware/verifyToken";
import isAdmin from "../../utils/helpers/isAdmin";
const router = express.Router();

router.delete("/delete/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ message: "Nije naveden ID objave." });
            return;
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "ID objave nije ispravan." });
            return;
        }
        const post = await Post.findByIdAndDelete(id);
        if (!post) {
            res.status(404).json({ message: "Objava ne postoji." });
            return;
        }
        res.status(200).json({ message: "Objava izbrisana." });
        return;
    } catch (error) {
        console.error(`Error in deleting post:\n ${error}`);
        res.status(500).json({ message: "Neuspjelo brisanje objave." });
        return;
    }
});

export default router;
