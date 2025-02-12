// controllers/notificationController.js
const Notification = require('../models/notification');

exports.createNotification = async (req, res) => {
    try {
        const { content, name, type, receiver } = req.body;
        const newNotification = new Notification({ content, name, type, receiver });
        await newNotification.save();
        res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
        if (!deletedNotification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
