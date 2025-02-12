// models/commitment.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const commitmentSchema = new mongoose.Schema({
    conditions: { type: String, required: true },
    investor: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor', required: true },
    innovator: { type: mongoose.Schema.Types.ObjectId, ref: 'Innovator', required: true },
    status: { type: String, default: 'Pending' },
    investorSign: { type: Boolean, default: false },
    innovatorSign: { type: Boolean, default: false }
});
module.exports = mongoose.model('Commitment', commitmentSchema);