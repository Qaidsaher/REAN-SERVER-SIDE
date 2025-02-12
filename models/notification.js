// models/notification.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const notificationSchema = new mongoose.Schema({
    content: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Innovator' }
});
module.exports = mongoose.model('Notification', notificationSchema);