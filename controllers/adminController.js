// controllers/adminController.js
const Admin = require("../models/admin");
const Category = require("../models/category");
const Innovation = require("../models/innovation");
const Innovator = require("../models/innovator");
const Investor = require("../models/investor");
const Commitment = require("../models/commitment");
const Investment = require("../models/investment");
const Notification = require("../models/notification");
const Chatting = require("../models/chatting");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: 'Admin not found' });
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const admin = req.admin;
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: 'Admin not found' });
        
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `Click the link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`
        };
        
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// controllers/adminController.js
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newAdmin = new Admin({ name, email, password: hashedPassword });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const { name, email } = req.body;
        const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, { name, email }, { new: true });
        if (!updatedAdmin) return res.status(404).json({ message: 'Admin not found' });
        res.json({ message: 'Admin updated successfully', updatedAdmin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
        if (!deletedAdmin) return res.status(404).json({ message: 'Admin not found' });
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCounts = async (req, res) => {
    try {
        const adminCount = await Admin.countDocuments();
        const categoryCount = await Category.countDocuments();
        const innovationCount = await Innovation.countDocuments();
        const innovatorCount = await Innovator.countDocuments();
        const investorCount = await Investor.countDocuments();
        const commitmentCount = await Commitment.countDocuments();
        const investmentCount = await Investment.countDocuments();
        const notificationCount = await Notification.countDocuments();
        const chattingCount = await Chatting.countDocuments();

        res.json({
            admins: adminCount,
            categories: categoryCount,
            innovations: innovationCount,
            innovators: innovatorCount,
            investors: investorCount,
            commitments: commitmentCount,
            investments: investmentCount,
            notifications: notificationCount,
            chatMessages: chattingCount
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching counts", error: error.message });
    }
};

// module.exports = { getAllCounts };