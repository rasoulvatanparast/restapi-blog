const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema(
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

    slug: {
      type: String,
      trim: true,
      unique: true,
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

module.exports = mongoose.model("Page", PageSchema);
