// models/investment.js
// backend/models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const investmentSchema = new mongoose.Schema({
    innovation: { type: mongoose.Schema.Types.ObjectId, ref: 'Innovation', required: true },
    commitment: { type: mongoose.Schema.Types.ObjectId, ref: 'Commitment', required: true },
    publishDate: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Investment', investmentSchema);