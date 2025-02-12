// models/chatting.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const chattingSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Innovator', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor', required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'Unread' },
    publishDate: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Chatting', chattingSchema);
