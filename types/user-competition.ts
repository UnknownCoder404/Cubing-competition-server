import { Types } from "mongoose";
import { AllowedEvent } from "./event";

export interface IUserCompetitionEvent {
    event: AllowedEvent;
    rounds: number[][];
}

export interface IUserCompetition {
    competitionId: Types.ObjectId;
    events: IUserCompetitionEvent[];
}
