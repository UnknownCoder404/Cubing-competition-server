import { Schema, model } from "mongoose";
import verifyPassword from "../functions/verifyPassword";
import allowedEvents from "../config/allowedEvents";
import { IUserDocument, IUserModel } from "../types/user";
import { IUserCompetition } from "../types/user-competition";

const userCompetitionSchema = new Schema<IUserCompetition>({
    // Rename the schema variable too for clarity
    competitionId: { type: Schema.Types.ObjectId, required: true },
    events: [
        {
            event: { type: String, required: true, enum: allowedEvents },
            rounds: [[Number]],
        },
    ],
});

const userSchema = new Schema<IUserDocument>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "user"] },
    competitions: [userCompetitionSchema], // Use the renamed schema
    group: { type: Number, enum: [1, 2], required: true },
});

userSchema.methods.comparePassword = async function (
    password: string,
): Promise<boolean> {
    try {
        return verifyPassword(password, this.password);
    } catch (err) {
        throw err;
    }
};

const User = model<IUserDocument, IUserModel>("User", userSchema);

export default User;
