import { Schema, model } from "mongoose";
// Define the schema for the Post model
const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    author: {
        id: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        username: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create the Post model using the schema
const Post = model("Post", postSchema);
export default Post;
