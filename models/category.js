// models/category.js
const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    publishDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
});
module.exports = mongoose.model('Category', categorySchema);