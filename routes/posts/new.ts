import express from "express";
import Post from "../../Models/post";
import authenticateSession from "../../middleware/authenticateSession";
import isAdmin from "../../middleware/isAdmin";
import findUser from "../../middleware/findUser";
import type { IUserDocument } from "../../types/user";

const router = express.Router();
router.post(
    "/new",
    authenticateSession,
    isAdmin,
    findUser,
    async (req, res) => {
        const user = req.user as IUserDocument;
        const userId = req.userId;
        const username = user.username;
        const { title, description } = req.body;

        try {
            const newPost = await Post.create({
                title: title,
                description: description,
                author: {
                    id: userId,
                    username: username,
                },
            });
            res.status(201).json(newPost);
        } catch (err) {
            console.error(`Error in creating post:\n ${err}`);
            res.status(500).json({
                message: "Neuspješno objavljivanje posta.",
            });
        }
    },
);
export default router;
