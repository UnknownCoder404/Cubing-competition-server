import { Types } from "mongoose";
import { type AllowedEvent } from "../config/allowedEvents";

export interface IUserCompetitionEvent {
    event: AllowedEvent;
    rounds: number[][];
}

export interface IUserCompetition {
    competitionId: Types.ObjectId;
    events: IUserCompetitionEvent[];
}
