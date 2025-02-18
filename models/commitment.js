// models/commitment.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const commitmentSchema = new mongoose.Schema({
    conditions: { type: String, required: true },
    milestones: [{ type: String }],
    investor: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor', required: true },
    innovator: { type: mongoose.Schema.Types.ObjectId, ref: 'Innovator', required: true },
    investorSign: { type: Boolean, default: false },
    innovatorSign: { type: Boolean, default: false },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Commitment', commitmentSchema);

