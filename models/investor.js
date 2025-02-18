// models/investor.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const investorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: { type: String, default: "" },
  city: { type: String, required: true },
  education: { type: String },
  password: { type: String, required: true },
  photo: { type: String },
  phone: { type: String, required: true },
  birthday: { type: Date, required: true },
  publishDate: { type: Date, default: Date.now },
  resetToken: String,                      // Token for password reset
  resetTokenExpires: Date      
});
module.exports = mongoose.model("Investor", investorSchema);
