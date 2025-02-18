// controllers/chattingController.js
const Chat = require('../models/chat');
const Message = require("../models/message");
const Investor = require("../models/investor");
const Innovator = require("../models/innovator");

exports.createChat = async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;
        const newChat = new Chat({ sender, receiver, message, status: 'unread' });
        await newChat.save();
        res.status(201).json({ message: 'Chat message sent successfully', chat: newChat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ Get all chats with investor name, innovator name, and message count
exports.getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find()
            .populate("innovator", "firstName lastName")
            .populate("investor", "firstName lastName");

        // Calculate the number of messages for each chat
        const chatsWithMessageCount = await Promise.all(
            chats.map(async (chat) => {
                const messageCount = await Message.countDocuments({ chatId: chat._id });

                return {
                    chatId: chat._id,
                    investorName: `${chat.investor?.firstName} ${chat.investor?.lastName}`,
                    innovatorName: `${chat.innovator?.firstName} ${chat.innovator?.lastName}`,
                    messageCount: messageCount,
                    createdAt: chat.createdAt
                };
            })
        );

        res.json(chatsWithMessageCount);
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getChatById = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteChat = async (req, res) => {
    try {
        const deletedChat = await Chat.findByIdAndDelete(req.params.id);
        if (!deletedChat) return res.status(404).json({ message: 'Chat not found' });
        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
