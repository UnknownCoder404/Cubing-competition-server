import { Document, Model } from "mongoose";
import { IUserCompetition } from "./user-competition";

export interface IUser {
    username: string;
    password?: string;
    role: "admin" | "user";
    competitions: IUserCompetition[];
    group: 1 | 2;
}

export interface IUserDocument extends IUser, Document {
    comparePassword(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {}
