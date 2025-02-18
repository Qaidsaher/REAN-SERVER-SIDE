// models/admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    state: { type: String },
    password: { type: String, required: true },
    publishDate: { type: Date, default: Date.now },
    resetToken: String,                      // Token for password reset
    resetTokenExpires: Date      
});
module.exports = mongoose.model('Admin', adminSchema);
