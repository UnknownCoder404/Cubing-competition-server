import mongoose from "mongoose";
import allowedEvents from "../config/allowedEvents";

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true, enum: allowedEvents },
    rounds: { type: Number, required: true },
});

const competitionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    events: [eventSchema],
    isLocked: { type: Boolean, default: false },
});

const Competition = mongoose.model("competitions", competitionSchema);

export default Competition;
