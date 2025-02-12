const express = require("express");
const router = express.Router();
const userChatController = require("../controllers/userChatController");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

router.put("/profile", authMiddleware, upload.single("photo"), userChatController.updateProfile);
// ✅ Route to Get User Profile
router.get("/profile", authMiddleware,userChatController.getProfile);

router.get("/investor-dashboard",  authMiddleware,userController.getInvestorDashboard);
router.post("/create-chat", authMiddleware, userChatController.getOrCreateChat);
router.post("/send-message", authMiddleware, userChatController.sendMessage);
router.get("/chats", authMiddleware, userChatController.getChats);
router.get("/chat-users", authMiddleware, userChatController.getUsers);
router.get("/messages/:chatId", authMiddleware, userChatController.getMessages);
router.put("/edit-message", authMiddleware, userChatController.editMessage);
router.delete("/delete-message/:messageId", authMiddleware, userChatController.deleteMessage);
router.get("/investors", authMiddleware, userChatController.getInvestors);
// router.get("/conversations", authMiddleware, userChatController.getUserConversations);
router.post("/change-password", authMiddleware, userChatController.changePassword);

// ✅ Delete Account Route (For both Innovators and Investors)
router.delete("/delete-account", authMiddleware, userChatController.deleteAccount);






router.get("/innovators",userChatController.getInnovators)

router.get("/innovators/:id", userChatController.getInnovatorById);

// ✅ Get all Innovations by Innovator ID
router.get("/innovators/:id/innovations", userChatController.getInnovationsByInnovator);
module.exports = router;
