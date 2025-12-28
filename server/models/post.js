import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      trim: true,
    },

    authorAvatar: {
      type: String,
      default: "",
    },

    postType: {
      type: String,
      enum: ["text", "image", "video", "article", "event"],
      required: true,
      default: "text",
    },

    content: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    image: {
      type: String,
      default: "",
    },

    video: {
      type: String,
      default: "",
    },

    article: {
      title: String,
      coverImage: String,
      body: String,
    },

    event: {
      title: String,
      description: String,
      date: Date,
      location: String,
    },

    likes: {
      type: Number,
      default: 0,
    },

    comments: [
      {
        user: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
