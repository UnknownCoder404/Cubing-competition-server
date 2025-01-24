import express from "express";
import Post from "../../Models/post";
const router = express.Router();
import isAdmin from "../../utils/helpers/isAdmin";
import findUser from "../../utils/helpers/findUser";
import verifyToken from "../../middleware/verifyToken";

router.put("/edit/:id", verifyToken, isAdmin, findUser, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "Id nije naveden." });
            return;
        }
        const { title, description } = req.body;
        if (
            !title ||
            !description ||
            typeof title !== "string" ||
            typeof description !== "string"
        ) {
            res.status(400).json({ message: "Neispravan format." });
            return;
        }
        const post = await Post.findByIdAndUpdate(
            id,
            {
                title,
                description,
                createdAt: new Date(),
                Author: {
                    username: req.user.username,
                    id: req.user.id,
                },
            },
            {
                new: true,
            },
        );
        if (!post) {
            res.status(404).json({ message: "Objava nije pronađena." });
            return;
        }
        res.status(200).json({ message: "Objava je ažurirana.", post });
        return;
    } catch (error) {
        console.error(`Error in editing post:\n ${error}`);
        res.status(500).json({ message: "Greška u serveru." });
    }
});
export default router;
