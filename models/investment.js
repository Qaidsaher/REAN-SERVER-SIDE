// models/investment.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const investmentSchema = new mongoose.Schema({
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Investor",
    required: true,
  },
  innovator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Innovator",
    required: true,
  },
  innovation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Innovation",
    required: true,
  },
  commitment: { type: mongoose.Schema.Types.ObjectId, ref: "Commitment" },
  amount: { type: Number, required: true },
  status: { type: String, default: "Active" },
  paymentSchedule: [
    {
      dueDate: { type: Date },
      amountDue: { type: Number },
      status: { type: String, default: "Pending" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Investment", investmentSchema);
