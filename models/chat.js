const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  innovator: { type: mongoose.Schema.Types.ObjectId, ref: "Innovator", required: true, unique: false },
  investor: { type: mongoose.Schema.Types.ObjectId, ref: "Investor", required: true, unique: false },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Ensure that an Innovator and Investor can have only one chat
chatSchema.index({ innovator: 1, investor: 1 }, { unique: true });

module.exports = mongoose.model("Chat", chatSchema);
