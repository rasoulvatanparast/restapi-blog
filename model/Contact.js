const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      minlength: 1,
      maxlength: 255,
      required: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 255,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", ContactSchema);
