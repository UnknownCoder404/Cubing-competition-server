import { Document, Model } from "mongoose";
import { AllowedEvent } from "../config/allowedEvents";

// Interface for the embedded event schema
export interface ICompetitionEvent {
    name: AllowedEvent;
    rounds: number;
}

// Interface for the main competition schema
export interface ICompetition {
    name: string;
    date: Date;
    events: ICompetitionEvent[];
    isLocked: boolean;
}

// Interface for the Competition document (extends ICompetition and Mongoose Document)
export interface ICompetitionDocument extends ICompetition, Document {}

// Interface for the CompetitionModel (for static methods if any, and for the model itself)
export interface ICompetitionModel extends Model<ICompetitionDocument> {}
