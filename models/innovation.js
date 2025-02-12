// models/innovation.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const innovationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  details: { type: String, required: true },
  status: { type: String, default: "Pending" },
  image: { type: String },
  video: { type: String },
  publishDate: { type: Date, default: Date.now },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Innovator",
    required: true,
  },
});
module.exports = mongoose.model("Innovation", innovationSchema);
