// models/notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Title of the notification
    content: { type: String, required: true }, // Content body
    senderType: { type: String, required: true, enum: ['Admin', 'Investor', 'Innovator'] }, // Type of sender
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Sender ID
    receiverType: { type: String, required: true, enum: ['Admin', 'Investor', 'Innovator'] }, // Receiver type
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Receiver ID
    type: { type: String, required: true, enum: ['System', 'User', 'Promotion'] }, // Type of notification
    status: { type: String, required: true, enum: ['Success', 'Warning', 'Failed', 'Info'] }, // Notification status indicator
    createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model('Notification', notificationSchema);