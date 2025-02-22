
const Investor = require("../models/investor");
const Innovator = require("../models/innovator");
const Innovation = require("../models/innovation");
const Investment = require("../models/investment");
const Category = require("../models/category");
const Commitment = require("../models/commitment");
const Chat = require("../models/chat");
const Notification = require("../models/notification");
const bcrypt = require("bcryptjs");

const fs = require("fs");
const path = require("path");
// Dashboard Controller


exports.dashboard = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.role?.toLowerCase();

        if (!userId || !userRole) {
            return res.status(400).json({ message: 'User ID or role is missing' });
        }

        let dashboardData = {};

        if (userRole === "investor") {
            // Investor-specific calculations
            const investorId = userId;

            const [
                totalInvestments,
                totalCommitments,
                pendingRequests,
                approvedInvestments,
                rejectedInvestments,
                totalInvestors,
                investmentTrends,
                categoryDistribution,
                investmentRequests
            ] = await Promise.all([
                Investment.countDocuments({ investor: investorId }),
                Commitment.countDocuments({ investor: investorId }),
                Investment.countDocuments({ investor: investorId, status: 'Pending' }),
                Investment.countDocuments({ investor: investorId, status: 'Approved' }),
                Investment.countDocuments({ investor: investorId, status: 'Rejected' }),
                Innovation.distinct('createdBy', { investor: investorId }).then(data => data.length),
                Investment.aggregate([
                    { $match: { investor: investorId } },
                    { $group: { _id: { $month: "$createdAt" }, investments: { $sum: "$amount" } } },
                    { $sort: { "_id": 1 } }
                ]).then(data => data.map(item => ({
                    month: `Month ${item._id}`,
                    investments: item.investments
                }))),
                Innovation.aggregate([
                    { $lookup: { from: 'investments', localField: '_id', foreignField: 'innovation', as: 'investments' } },
                    { $unwind: '$investments' },
                    { $match: { 'investments.investor': investorId } },
                    { $group: { _id: '$category', value: { $sum: 1 } } }
                ]).then(data => data.map(item => ({
                    category: item._id,
                    value: item.value
                }))),
                Investment.find({ investor: investorId, status: 'Pending' })
                    .populate('innovation', 'name')
                    .select('amount innovation status')
            ]);

            dashboardData = {
                totalInvestments,
                totalCommitments,
                pendingRequests,
                approvedInvestments,
                rejectedInvestments,
                totalInvestors,
                investmentTrends,
                categoryDistribution,
                investmentRequests
            };

        } else if (userRole === "innovator") {
            // Innovator-specific calculations
            const innovatorId = userId;

            const [
                notificationsCount,
                chatCount,
                totalInnovations,
                totalFunding,
                commitmentsCount,
                investmentTrends,
                pendingInnovations,
                investmentRequests
            ] = await Promise.all([
                Notification.countDocuments({ receiverId: innovatorId, receiverType: 'Innovator' }),
                Chat.countDocuments({ innovator: innovatorId }),
                Innovation.countDocuments({ createdBy: innovatorId }),
                Investment.aggregate([
                    { $match: { innovator: innovatorId } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]).then(result => (result.length ? result[0].total : 0)),
                Commitment.countDocuments({ innovator: innovatorId }),
                Investment.aggregate([
                    { $match: { innovator: innovatorId } },
                    { $group: { _id: { $month: "$createdAt" }, investments: { $sum: "$amount" } } },
                    { $sort: { "_id": 1 } }
                ]).then(data => data.map(item => ({
                    month: `Month ${item._id}`,
                    investments: item.investments
                }))),
                Innovation.find({ createdBy: innovatorId, status: 'Pending' }).select('name'),
                Investment.find({ innovator: innovatorId, status: 'Pending' })
                    .populate('investor', 'firstName lastName')
                    .select('amount investor')
            ]);

            dashboardData = {
                notifications: notificationsCount,
                chats: chatCount,
                totalInnovations,
                totalFunding,
                commitments: commitmentsCount,
                investmentTrends,
                pendingInnovations,
                investmentRequests
            };

        } else {
            return res.status(403).json({ message: "Invalid role." });
        }

        // Send the response
        res.status(200).json(dashboardData);

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};


// Function for investors to create investments with commitments
exports.createInvestmentWithCommitment = async (req, res) => {
    // console.log('Starting createInvestmentWithCommitment');

    try {
        const { innovationId, amount, milestones } = req.body;
        const investorId = req.user.id;

        // console.log('Received request data', { innovationId, amount, milestones, investorId });

        // Check if the innovation exists
        const innovation = await Innovation.findById(innovationId);
        if (!innovation) {
            console.log(`Innovation with ID ${innovationId} not found`);
            return res.status(404).json({ message: "Innovation not found" });
        }

        // Create a new commitment
        // console.log('Creating commitment');
        const commitment = new Commitment({
            conditions: "saher",
            milestones,
            investor: investorId,
            innovator: innovation.createdBy,
            status: "Pending",
        });

        await commitment.save();
        // console.log('Commitment created successfully', { commitmentId: commitment._id });

        // Create a notification for the innovator
        console.log('Creating notification for innovator');
        const notification = new Notification({
            title: "New Commitment Created",
            content: "A new investment commitment requires your conditions.",
            senderType: "Investor",
            senderId: investorId,
            receiverType: "Innovator",
            receiverId: innovation.createdBy,
            type: "System",
            status: "Info",
        });

        await notification.save();
        // console.log('Notification created successfully', { notificationId: notification._id });

        // Create the investment
        console.log('Creating investment');
        const investment = new Investment({
            investor: investorId,
            innovator: innovation.createdBy,
            innovation: innovationId,
            commitment: commitment._id,
            amount,
            status: "Pending",
        });

        await investment.save();
        // console.log('Investment created successfully', { investmentId: investment._id });

        res.status(201).json({ message: "Investment created successfully", investment });

    } catch (error) {
        // console.log('Error in createInvestmentWithCommitment', { error: error.message, stack: error.stack });
        // console.error(error);
        res.status(500).json({ message: "Failed to create investment", error: error.message });
    }
};
// Function for innovator to add conditions
exports.addCommitmentConditions = async (req, res) => {
    try {
        const { commitmentId, conditions } = req.body;
        const innovatorId = req.user.id;

        const commitment = await Commitment.findById(commitmentId);
        if (!commitment || String(commitment.innovator) !== innovatorId) {
            return res.status(403).json({ message: "Unauthorized or commitment not found" });
        }

        commitment.conditions = conditions;
        await commitment.save();

        res.status(200).json({ message: "Conditions added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add conditions", error: error.message });
    }
};

// Function for investor to sign commitment
exports.signCommitmentInvestor = async (req, res) => {
    try {
        const { commitmentId } = req.body;
        const investorId = req.user.id;

        const commitment = await Commitment.findById(commitmentId);
        if (!commitment || String(commitment.investor) !== investorId) {
            return res.status(403).json({ message: "Unauthorized or commitment not found" });
        }

        commitment.investorSign = true;
        await commitment.save();

        res.status(200).json({ message: "Investor signed the commitment successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to sign commitment", error: error.message });
    }
};

// Function for innovator to sign commitment
exports.signCommitmentInnovator = async (req, res) => {
    try {
        const { commitmentId } = req.body;
        const innovatorId = req.user.id;

        const commitment = await Commitment.findById(commitmentId);
        if (!commitment || String(commitment.innovator) !== innovatorId) {
            return res.status(403).json({ message: "Unauthorized or commitment not found" });
        }

        commitment.innovatorSign = true;
        await commitment.save();

        res.status(200).json({ message: "Innovator signed the commitment successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to sign commitment", error: error.message });
    }
};

// Function to get user commitments
exports.getUserCommitments = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.role.toLowerCase();

        let commitments;
        if (userRole === "investor") {
            commitments = await Commitment.find({ investor: userId }).populate("innovator");
        } else if (userRole === "innovator") {
            commitments = await Commitment.find({ innovator: userId }).populate("investor");
        } else {
            return res.status(403).json({ message: "Invalid role." });
        }

        res.status(200).json(commitments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get commitments", error: error.message });
    }
};

// Function to get user investments
exports.getUserInvestments = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.role.toLowerCase();

        let investments;
        if (userRole === "investor") {
            investments = await Investment.find({ investor: userId }).populate("innovation innovator");
        } else if (userRole === "innovator") {
            investments = await Investment.find({ innovator: userId }).populate("innovation investor");
        } else {
            return res.status(403).json({ message: "Invalid role." });
        }

        res.status(200).json(investments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get investments", error: error.message });
    }
};

// ✅ Fetch a specific commitment by ID
exports.getCommitmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const commitment = await Commitment.findById(id).populate("investor").populate("innovator");

        if (!commitment) {
            return res.status(404).json({ message: "Commitment not found" });
        }

        res.status(200).json(commitment);
    } catch (error) {
        console.error("Error fetching commitment by ID:", error);
        res.status(500).json({ message: "Server error while fetching commitment" });
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
            bio,
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
        user.bio = bio || user.bio;

        if (role === "innovator") {
            user.accountX = accountX || user.accountX;
        }

        // Handle Password Update (If Provided)
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Determine server URL (update SERVER_URL in your .env as needed)
        const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

        // Handle Profile Photo Upload (If Provided)
        if (req.file) {
            // Remove old photo if exists
            if (user.photo) {
                // Remove the serverUrl part to get the relative path
                const relativePath = user.photo.split(`${serverUrl}`)[1];
                if (relativePath) {
                    const filePath = path.join(__dirname, "..", relativePath);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            }
            // Update with the new photo, adding the server URL
            user.photo = `${serverUrl}/uploads/${req.file.filename}`;
        }

        await user.save();

        res.status(200).json({ message: "Profile updated successfully!", user });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.role.toLowerCase();

        let notifications;
        if (userRole === "investor") {
            notifications = await Notification.find({ receiverType: "Investor", receiverId: userId });
        } else if (userRole === "innovator") {
            notifications = await Notification.find({ receiverType: "Innovator", receiverId: userId });
        } else {
            return res.status(403).json({ message: "Invalid role." });
        }

        res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get notifications", error: error.message });
    }
};

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

