// controllers/adminController.js
const Admin = require("../models/admin");
const Category = require("../models/category");
const Innovation = require("../models/innovation");
const Innovator = require("../models/innovator");
const Investor = require("../models/investor");
const Message = require("../models/message");

const Commitment = require("../models/commitment");
const Investment = require("../models/investment");
const Notification = require("../models/notification");
const Chat = require("../models/chat");
const bcrypt = require('bcryptjs');
exports.getAdminDashboard = async (req, res) => {
    try {
        // Fetch basic counts
        const adminCount = await Admin.countDocuments();
        const categoryCount = await Category.countDocuments();
        const chatCount = await Chat.countDocuments();
        const commitmentCount = await Commitment.countDocuments();
        const innovationCount = await Innovation.countDocuments();
        const innovatorCount = await Innovator.countDocuments();
        const investmentCount = await Investment.countDocuments();
        const investorCount = await Investor.countDocuments();
        const messageCount = await Message.countDocuments();
        const notificationCount = await Notification.countDocuments();

        // Fetch data for charts
        const innovationsByCategory = await Innovation.aggregate([
            {
                $group: {
                    _id: "$category",
                    name: { $first: "$name" }, // Assuming you have categoryName in the schema or you may need a $lookup
                    count: { $sum: 1 }
                }
            }
        ]);

        const investmentsByStatus = await Investment.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const innovationsByStatus = await Innovation.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const chatsByDate = await Chat.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const notificationsByStatus = await Notification.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const messagesByDate = await Message.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Prepare response
        const dashboardData = {
            totals: {
                admins: adminCount,
                categories: categoryCount,
                chats: chatCount,
                commitments: commitmentCount,
                innovations: innovationCount,
                innovators: innovatorCount,
                investments: investmentCount,
                investors: investorCount,
                messages: messageCount,
                notifications: notificationCount,
            },
            charts: {
                innovationsByCategory,
                investmentsByStatus,
                innovationsByStatus,
                chatsByDate,
                notificationsByStatus,
                messagesByDate
            },
            recent: {
                latestInnovations: await Innovation.find().sort({ publishDate: -1 }).limit(5),
                latestInvestments: await Investment.find().sort({ createdAt: -1 }).limit(5),
                latestMessages: await Message.find().sort({ timestamp: -1 }).limit(5),
                latestNotifications: await Notification.find().sort({ createdAt: -1 }).limit(5),
            }
        };

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        res.status(500).json({ error: "Internal Server Error" });
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
        const chattingCount = await Chat.countDocuments();

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