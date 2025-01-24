import { Types } from "mongoose";
import { getUserById } from "./getUserById";

export async function getUsernameById(id: string | Types.ObjectId) {
    try {
        const user = await getUserById(id);
        if (!user) {
            return null;
        }
        return user ? (user.username ? user.username : null) : null;
    } catch (err) {
        console.error(err);
        return null;
    }
}
