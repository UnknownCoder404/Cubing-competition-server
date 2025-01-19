import { Schema, model } from "mongoose";
import verifyPassword from "../functions/verifyPassword";
import allowedEvents from "../config/allowedEvents";

// competitionId is the Id of the competition that the user participated in
const competitionSchema = new Schema({
    competitionId: { type: Schema.Types.ObjectId, required: true },
    events: [
        {
            event: { type: String, required: true, enum: allowedEvents },
            rounds: [[Number]],
        },
    ],
});
// Define a schema for the user model
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "user"] },
    competitions: [competitionSchema],
    group: { type: Number, enum: [1, 2], required: true },
});
// Add a method to compare the password with the hashed one
userSchema.methods.comparePassword = async function (password: string) {
    try {
        // Return a boolean value indicating the match
        return verifyPassword(password, this.password);
    } catch (err) {
        // Handle the error
        throw err;
    }
};
// Create a user model from the schema
const User = model("User", userSchema);

export default User;
