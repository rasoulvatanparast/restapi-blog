const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },

    indexImage: {
      type: String,
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },

    mode: {
      type: String,
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", PostSchema);
