const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    maxlength: 255,
  },

  uuid: {
    type: String,
    trim: true,
    required: true,
  },

  expiresAt: {
    type: String,
    required: true,
  },

  createdAt: {
    type: String,
    required: true,
  },

  used: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("ForgetPass", UserSchema);
