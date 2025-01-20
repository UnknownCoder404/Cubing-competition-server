import User from "../Models/user";
import { Types } from "mongoose";
import { IUserDocument } from "../types/user";

export async function getUserById(
    id: string | Types.ObjectId,
    fields: string | null = null,
): Promise<IUserDocument | null> {
    try {
        let query = User.findOne({ _id: id });
        if (fields) {
            query = query.select(fields);
        }
        const user = (await query) as IUserDocument | null;
        return user;
    } catch (err) {
        console.error(err);
        return null;
    }
}
