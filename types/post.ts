import { Types, Document, Model } from "mongoose";

// Interface for the author subdocument
export interface IPostAuthor {
    id: Types.ObjectId;
    username: string;
}

// Interface for the Post data
export interface IPost {
    title: string;
    description: string;
    author: IPostAuthor;
    createdAt: Date;
}

// Interface for the Post document (extends IPost and Mongoose Document)
export interface IPostDocument extends IPost, Document {}

// Interface for the PostModel (for static methods if any, and for the model itself)
export interface IPostModel extends Model<IPostDocument> {}
