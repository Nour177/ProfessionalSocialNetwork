import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      trim: true,
    },

    authorAvatar: {
      type: String, //path
      default: "",
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    image: {
      type: String,
      default: "",
    },

    likes: {
      type: Number,
      default: 0,
    },

    comments: [
      {
        user: {
          type: String,
        },
        text: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
