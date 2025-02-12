const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderType: { type: String, enum: ["Innovator", "Investor"], required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ["Unread", "Read"], default: "Unread" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
