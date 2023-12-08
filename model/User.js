const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 255,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 255,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 1024,
    },

    permissionLevel: {
      type: Number,
      default: 5,
    },

    active: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
