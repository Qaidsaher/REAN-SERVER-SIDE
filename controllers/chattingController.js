// controllers/chattingController.js
const Chatting = require('../models/chatting');

exports.createChat = async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;
        const newChat = new Chatting({ sender, receiver, message, status: 'unread' });
        await newChat.save();
        res.status(201).json({ message: 'Chat message sent successfully', chat: newChat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllChats = async (req, res) => {
    try {
        const chats = await Chatting.find();
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getChatById = async (req, res) => {
    try {
        const chat = await Chatting.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteChat = async (req, res) => {
    try {
        const deletedChat = await Chatting.findByIdAndDelete(req.params.id);
        if (!deletedChat) return res.status(404).json({ message: 'Chat not found' });
        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
