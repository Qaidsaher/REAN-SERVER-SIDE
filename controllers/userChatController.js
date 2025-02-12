const Chat = require("../models/chat");
const Message = require("../models/message");
const Investor = require("../models/investor");
const Innovator = require("../models/innovator");

// ✅ 1️⃣ Get or Create a Chat between an Innovator and an Investor
// exports.getOrCreateChat = async (req, res) => {
//   try {
//     const { innovatorId, investorId } = req.body;

//     let chat = await Chat.findOne({
//       innovator: innovatorId,
//       investor: investorId,
//     });

//     if (!chat) {
//       chat = new Chat({ innovator: innovatorId, investor: investorId });
//       await chat.save();
//     }

//     res.status(200).json(chat);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error creating chat", error: error.message });
//   }
// };
exports.getOrCreateChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.role.toLowerCase();
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    let innovatorId, investorId;

    if (userRole === "investor") {
      investorId = userId;
      innovatorId = receiverId;
    } else if (userRole === "innovator") {
      innovatorId = userId;
      investorId = receiverId;
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    let chat = await Chat.findOne({
      innovator: innovatorId,
      investor: investorId,
    });

    if (!chat) {
      chat = new Chat({ innovator: innovatorId, investor: investorId });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating chat", error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    console.log("🔹 Received request data:", req.body); // ✅ Log incoming request data

    const { chatId, senderId, senderType, content } = req.body;

    // ✅ Check for missing fields
    if (!chatId || !senderId || !content || !senderType) {
      console.error("❌ Missing required fields:", {
        chatId,
        senderId,
        senderType,
        content,
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Validate chat existence
    const chatExists = await Chat.findById(chatId);
    if (!chatExists) {
      console.error("❌ Chat not found for chatId:", chatId);
      return res.status(404).json({ message: "Chat does not exist" });
    }

    // ✅ Create and save the message
    const message = new Message({
      chatId,
      sender: senderId,
      senderType,
      content,
      status: "Unread",
      timestamp: new Date(),
    });

    await message.save();
    console.log("✅ Message saved successfully:", message);
    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  }
};

exports.getInnovatorChats = async (req, res) => {
  try {
    const innovatorId = req.user.id;
    const userRole = req.role.toLowerCase();
    console.log("user type is  : ", userRole);
    // ✅ Find all chats for the Innovator and populate investor details
    const chats = await Chat.find({ innovator: innovatorId }).populate(
      "investor",
      "firstName lastName email"
    );

    // ✅ Fetch last message and unread message count for each chat
    const chatWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        // ✅ Get the last message
        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ timestamp: -1 }) // Get latest message
          .select("content timestamp sender senderType");

        // ✅ Count unread messages for the innovator (excluding their own messages)
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          senderType: "Investor", // Messages from Investors only
          status: "Unread",
        });

        return {
          _id: chat._id,
          investor: chat.investor,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                timestamp: lastMessage.timestamp,
                senderType: lastMessage.senderType,
              }
            : null, // If no messages exist, set `lastMessage` as `null`
          unreadMessages: unreadCount, // Number of unread messages
        };
      })
    );

    // ✅ Sort chats by most recent message timestamp
    chatWithLastMessage.sort(
      (a, b) => b.lastMessage?.timestamp - a.lastMessage?.timestamp
    );

    res.status(200).json(chatWithLastMessage);
  } catch (error) {
    console.error("❌ Error fetching innovator chats:", error);
    res.status(500).json({
      message: "Error fetching chats",
      error: error.message,
    });
  }
};

// ✅ 4️⃣ Get All Messages in a Chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // ✅ Check if `chatId` is valid
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }
    // ✅ Update only messages where the sender is NOT the current user
    await Message.updateMany(
      { chatId, sender: { $ne: req.user.id }, status: "Unread" }, // Only unread messages from others
      { $set: { status: "read" } } // Mark them as read
    );

    const messages = await Message.find({ chatId })
      .populate("sender", "firstName lastName")
      .sort({ timestamp: 1 });

    // ✅ If no messages found, return empty array (not 404)
    if (!messages.length) {
      return res.status(200).json([]); // Empty array instead of error
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
};

// ✅ 5️⃣ Edit a Message
exports.editMessage = async (req, res) => {
  try {
    const { messageId, newContent } = req.body;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { content: newContent },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json(message);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error editing message", error: error.message });
  }
};

// ✅ 6️⃣ Delete a Message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deletedMessage = await Message.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting message", error: error.message });
  }
};

// ✅ 7️⃣ Get All Investors for Innovator to Start a Chat
exports.getInvestors = async (req, res) => {
  try {
    const investors = await Investor.find().select("firstName lastName email");
    res.status(200).json(investors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching investors", error: error.message });
  }
};
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Chat.aggregate([
      { $match: { $or: [{ innovator: userId }, { investor: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "chatId",
          as: "messages",
        },
      },
      {
        $project: {
          _id: 1,
          participantId: {
            $cond: {
              if: { $eq: ["$innovator", userId] },
              then: "$investor",
              else: "$innovator",
            },
          },
          lastMessage: { $arrayElemAt: ["$messages.content", -1] },
          lastMessageDate: { $arrayElemAt: ["$messages.timestamp", -1] },
        },
      },
    ]);

    console.log("chats : ", conversations.length);
    res.status(200).json(conversations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching conversations", error: error.message });
  }
};
// ✅ 4️⃣ Get All Chats for an Investor (🔹 New Function)
exports.getInvestorChats = async (req, res) => {
  try {
    const investorId = req.user.id;

    const chats = await Chat.find({ investor: investorId }).populate(
      "innovator",
      "firstName lastName email"
    );

    res.status(200).json(chats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching investor chats", error: error.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.role.toLowerCase(); // "innovator" or "investor"

    // Determine the correct field names
    const chatFilter =
      userRole === "investor" ? { investor: userId } : { innovator: userId };
    const populateField = userRole === "investor" ? "innovator" : "investor";

    // ✅ Find all chats for the user and populate the correct counterpart
    const chats = await Chat.find(chatFilter).populate(
      populateField,
      "firstName lastName email photo"
    );

    // ✅ Fetch last message and unread messages count
    const chatWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        // ✅ Get the last message
        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ timestamp: -1 }) // Get latest message
          .select("content timestamp sender senderType");

        // ✅ Count unread messages for the user (excluding their own messages)
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          senderType: req.role === "investor" ? "Innovator" : "Investor", // Messages from counterpart only
          status: "Unread",
        });

        return {
          _id: chat._id,
          participant: chat[populateField], // Either Innovator or Investor details
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                timestamp: lastMessage.timestamp,
                senderType: lastMessage.senderType,
              }
            : null, // If no messages exist, set `lastMessage` as `null`
          unreadMessages: unreadCount, // Number of unread messages
        };
      })
    );

    // ✅ Sort chats by most recent message timestamp
    chatWithLastMessage.sort(
      (a, b) => b.lastMessage?.timestamp - a.lastMessage?.timestamp
    );

    res.status(200).json(chatWithLastMessage);
  } catch (error) {
    console.error("❌ Error fetching chats:", error);
    res.status(500).json({
      message: "Error fetching chats",
      error: error.message,
    });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const userRole = req.role.toLowerCase();

    let users;
    if (userRole === "investor") {
      users = await Innovator.find().select("firstName lastName email");
    } else if (userRole === "innovator") {
      users = await Investor.find().select("firstName lastName email");
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// ✅ Get Profile (for both Innovators and Investors)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user ID from the token
    const userRole = req.role; // Check the role (Innovator or Investor)

    let userProfile;

    if (userRole === "innovator") {
      userProfile = await Innovator.findById(userId).select("-password"); // Exclude password
    } else if (userRole === "investor") {
      userProfile = await Investor.findById(userId).select("-password"); // Exclude password
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: userProfile });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      city,
      education,
      phone,
      birthday,
      accountX,
      password,
    } = req.body;
    const userId = req.user.id; // Extract user ID from token/session
    const role = req.role; // Extract role (Innovator or Investor)

    let userModel;
    if (role === "innovator") {
      userModel = Innovator;
    } else if (role === "investor") {
      userModel = Investor;
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }

    // Find user by ID
    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.city = city || user.city;
    user.education = education || user.education;
    user.phone = phone || user.phone;
    user.birthday = birthday || user.birthday;

    if (role === "innovator") {
      user.accountX = accountX || user.accountX;
    }

    // Handle Password Update (If Provided)
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Handle Profile Photo Upload (If Provided)
    if (req.file) {
      console.log("there is file : ");
      user.photo = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.status(200).json({ message: "Profile updated successfully!", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const bcrypt = require("bcryptjs");

// ✅ Change Password (For both Innovators and Investors)
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user ID from token
    const userRole = req.role; // Get user role (Innovator or Investor)

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both old and new passwords are required." });
    }
    console.log("change - password");
    let user;
    if (userRole === "innovator") {
      user = await Innovator.findById(userId);
    } else if (userRole === "investor") {
      user = await Investor.findById(userId);
    } else {
      console.log("change - Invalid user role");
      return res.status(400).json({ message: "Invalid user role" });
    }

    if (!user) {
      console.log("change - User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    // Hash new password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("❌ Error updating password:", error);
    res
      .status(500)
      .json({ message: "Error updating password", error: error.message });
  }
};
// ✅ Delete Account (For both Innovators and Investors)
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user ID from token
    const userRole = req.role; // Get user role (Innovator or Investor)

    let user;
    if (userRole === "innovator") {
      user = await Innovator.findByIdAndDelete(userId);
    } else if (userRole === "investor") {
      user = await Investor.findByIdAndDelete(userId);
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    res
      .status(500)
      .json({ message: "Error deleting account", error: error.message });
  }
};

// const Innovator = require("../models/innovator");
const Innovation = require("../models/innovation");
// ✅ Get All Innovators
exports.getInnovators = async (req, res) => {
  try {
    const innovators = await Innovator.find().select("-password");
    res.status(200).json(innovators);
  } catch (error) {
    console.error("❌ Error fetching innovators:", error);
    res
      .status(500)
      .json({ message: "Error fetching innovators", error: error.message });
  }
};

// ✅ Get Innovator by ID
exports.getInnovatorById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the innovator and populate necessary fields
    const innovator = await Innovator.findById(id).select("-password");

    if (!innovator) {
      return res.status(404).json({ message: "Innovator not found" });
    }

    res.status(200).json(innovator);
  } catch (error) {
    console.error("❌ Error fetching innovator:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Innovations by Innovator ID
exports.getInnovationsByInnovator = async (req, res) => {
  try {
    const { id } = req.params;

    // Find innovations created by this innovator
    const innovations = await Innovation.find({ createdBy: id }).populate(
      "category"
    );

    res.status(200).json(innovations);
  } catch (error) {
    console.error("❌ Error fetching innovations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
