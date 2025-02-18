const Innovation = require("../models/innovation");
const Investment = require("../models/investment");
const Category = require("../models/category");
const Investor = require("../models/investor"); // ✅ Use Investors model
const Innovator = require("../models/innovator");
const Commitment = require("../models/commitment");
const Chat = require("../models/chat");
const Notification = require("../models/notification");

// const Investors = require("../models/Investors");
// ✅ Get all innovations created by the user
exports.getUserInnovations = async (req, res) => {
  try {
    const innovations = await Innovation.find({
      createdBy: req.user.id,
    }).populate("category");
    res.status(200).json(innovations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching innovations", error: error.message });
  }
};

exports.getInnovations = async (req, res) => {
  try {
    const innovations = await Innovation.find().populate("category createdBy");

    res.status(200).json(innovations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching innovations", error: error.message });
  }
};

// ✅ Create a new innovation

// ✅ Create a new innovation
exports.createInnovation = async (req, res) => {
  try {
    const { name, description, cost, details, category } = req.body;

    // ✅ Handle File Uploads (If Provided)
    let imagePath = null;
    let videoPath = null;

    if (req.files) {
      if (req.files["image"]) {
        imagePath = `/uploads/${req.files["image"][0].filename}`;
      }
      if (req.files["video"]) {
        videoPath = `/uploads/${req.files["video"][0].filename}`;
      }
    }

    const newInnovation = new Innovation({
      name,
      description,
      cost,
      details,
      image: imagePath, // Save the correct image path
      video: videoPath, // Save the correct video path
      category,
      createdBy: req.user.id, // Attach logged-in user
    });

    await newInnovation.save();
    res.status(201).json(newInnovation);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating innovation", error: error.message });
  }
};

// ✅ Update an innovation
exports.updateInnovation = async (req, res) => {
  try {
    const innovation = await Innovation.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!innovation)
      return res.status(404).json({ message: "Innovation not found" });

    const updatedData = req.body;

    // ✅ Handle File Updates (If Provided)
    if (req.files) {
      if (req.files["image"]) {
        updatedData.image = `/uploads/${req.files["image"][0].filename}`;
      }
      if (req.files["video"]) {
        updatedData.video = `/uploads/${req.files["video"][0].filename}`;
      }
    }

    const updatedInnovation = await Innovation.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.status(200).json(updatedInnovation);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating innovation", error: error.message });
  }
};

// ✅ Delete an innovation
exports.deleteInnovation = async (req, res) => {
  try {
    const innovation = await Innovation.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!innovation)
      return res.status(404).json({ message: "Innovation not found" });

    await Innovation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Innovation deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting innovation", error: error.message });
  }
};

// ✅ Get all investments related to the user
exports.getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find().populate(
      "innovation commitment"
    );
    res.status(200).json(investments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching investments", error: error.message });
  }
};

// ✅ Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

// ✅ Get all investors
exports.getInvestors = async (req, res) => {
  try {
    const investors = await Investor.find().select(
      "_id firstName lastName email"
    );
    res.status(200).json(investors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching investors", error: error.message });
  }
};

// ✅ Get Profile (for both Innovators and Investors)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get logged-in user ID from the token
    const userRole = req.user.role; // Check the role (Innovator or Investor)

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
    const role = req.user.role; // Extract role (Innovator or Investor)

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
      user.photo = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.status(200).json({ message: "Profile updated successfully!", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// const Investment = require("../models/investment");

exports.getInvestorDashboard = async (req, res) => {
  try {
    const investorId = req.user.id;

    const totalInvestments = await Investment.countDocuments({
      investor: investorId,
    });
    const totalCommitments = await Commitment.countDocuments({
      investor: investorId,
    });
    const pendingRequests = await Investment.countDocuments({
      investor: investorId,
      status: "Pending",
    });
    const approvedInvestments = await Investment.countDocuments({
      investor: investorId,
      status: "Approved",
    });

    const investmentTrends = await Investment.aggregate([
      { $match: { investor: investorId } },
      { $group: { _id: { $month: "$createdAt" }, investments: { $sum: 1 } } },
      { $project: { month: "$_id", investments: 1, _id: 0 } },
      { $sort: { month: 1 } },
    ]);

    const recentInvestments = await Investment.find({ investor: investorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("innovation", "name");

    res.status(200).json({
      totalInvestments,
      totalCommitments,
      pendingRequests,
      approvedInvestments,
      investmentTrends,
      recentInvestments: recentInvestments.map((inv) => ({
        id: inv._id,
        innovationName: inv.innovation.name,
        date: inv.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getInnovatorDashboard = async (req, res) => {
  try {
      const innovatorId = req.user.id; // Assuming user ID is set in `req.user`

      // ✅ 1. Get Notifications Count
      const notificationsCount = await Notification.countDocuments({ receiverId: innovatorId, receiverType: 'Innovator' });

      // ✅ 2. Get Chat Count
      const chatCount = await Chat.countDocuments({ innovator: innovatorId });

      // ✅ 3. Get Total Innovations
      const totalInnovations = await Innovation.countDocuments({ createdBy: innovatorId });

      // ✅ 4. Get Total Funding from Investments
      const totalFunding = await Investment.aggregate([
          { $match: { innovator: innovatorId } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const totalFundingAmount = totalFunding.length ? totalFunding[0].total : 0;

      // ✅ 5. Get Commitments Count
      const commitmentsCount = await Commitment.countDocuments({ innovator: innovatorId });

      // ✅ 6. Get Investment Trends (grouped by month)
      const investmentTrends = await Investment.aggregate([
          { $match: { innovator: innovatorId } },
          {
              $group: {
                  _id: { $month: "$createdAt" },
                  investments: { $sum: "$amount" }
              }
          },
          { $sort: { "_id": 1 } }
      ]).then(data => data.map(item => ({
          month: `Month ${item._id}`,
          investments: item.investments
      })));

      // ✅ 7. Get Pending Innovations
      const pendingInnovations = await Innovation.find({ createdBy: innovatorId, status: 'Pending' }).select('name');
      console.log("pend",JSON.stringify(pendingInnovations))  
      // ✅ 8. Get Investment Requests (pending investments)
      const investmentRequests = await Investment.find({ innovator: innovatorId, status: 'Pending' })
          .populate('investor', 'firstName lastName')
          .select('amount investor');

      // ✅ Combine all data into a single response
      const dashboardData = {
          notifications: notificationsCount,
          chats: chatCount,
          totalInnovations,
          totalFunding: totalFundingAmount,
          commitments: commitmentsCount,
          investmentTrends,
          pendingInnovations,
          investmentRequests
      };

      res.status(200).json(dashboardData);

  } catch (error) {
      console.error("❌ Error fetching innovator dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

exports.handleInvestmentRequest = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment)
      return res.status(404).json({ message: "Investment request not found" });

    investment.status = req.body.status;
    await investment.save();
    res.json({ message: "Investment status updated", investment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating investment", error: error.message });
  }
};

exports.getInnovatorStats = async (req, res) => {
  try {
    const innovatorId = req.user.id;

    // ✅ Fetch counts of innovations (total, approved, pending, rejected)
    const totalInnovations = await Innovation.countDocuments({
      createdBy: innovatorId,
    });
    const approvedInnovations = await Innovation.countDocuments({
      createdBy: innovatorId,
      status: "Approved",
    });
    const rejectedInnovations = await Innovation.countDocuments({
      createdBy: innovatorId,
      status: "Rejected",
    });

    const pendingInnovations = await Innovation.find({
      createdBy: innovatorId,
      status: "Pending",
    }).select("name status createdAt");

    // ✅ Fetch total funding received from investments
    const totalFunding = await Investment.aggregate([
      { $match: { innovator: innovatorId, status: "Approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // ✅ Fetch pending investment requests
    const investmentRequests = await Investment.find({
      innovator: innovatorId,
      status: "Pending",
    })
      .populate("investor", "firstName lastName photo email")
      .select("amount status createdAt");

    // ✅ Fetch commitments made for innovations
    const totalCommitments = await Commitment.countDocuments({
      innovator: innovatorId,
    });

    // ✅ Fetch total chats & conversations with investors
    const chats = await Chat.countDocuments({ innovator: innovatorId });

    // ✅ Fetch recent notifications for the innovator
    const recentNotifications = await Notification.find({ user: innovatorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("message createdAt type");
    const investmentTrends = [
      { month: "Jan", investments: 2000 },
      { month: "Feb", investments: 4500 },
      { month: "Mar", investments: 3800 },
      { month: "Apr", investments: 5100 },
      { month: "May", investments: 6200 },
      { month: "Jun", investments: 7500 },
      { month: "Jul", investments: 4200 },
      { month: "Aug", investments: 5300 },
      { month: "Sep", investments: 6800 },
      { month: "Oct", investments: 7200 },
      { month: "Nov", investments: 6100 },
      { month: "Dec", investments: 8000 },
    ];

    // const formattedTrends  = await Investment.aggregate([
    //   {
    //     $match: { innovator: req.user.id }, // Filter investments for the logged-in innovator
    //   },
    //   {
    //     $group: {
    //       _id: { $month: "$createdAt" }, // Group by month
    //       totalInvestments: { $sum: "$amount" }, // Sum of investments per month
    //     },
    //   },
    //   {
    //     $sort: { _id: 1 }, // Sort results from January to December
    //   },
    // ]);

    // // 📌 Convert MongoDB month index to readable names
    // const monthNames = [
    //   "Jan",
    //   "Feb",
    //   "Mar",
    //   "Apr",
    //   "May",
    //   "Jun",
    //   "Jul",
    //   "Aug",
    //   "Sep",
    //   "Oct",
    //   "Nov",
    //   "Dec",
    // ];
    // const investmentTrends  = investmentTrends.map((item) => ({
    //   month: monthNames[item._id - 1], // Convert month index to name
    //   investments: item.totalInvestments,
    // }));

    // ✅ Prepare structured response
    res.json({
      totalInnovations,
      approvedInnovations,
      pendingInnovations,
      rejectedInnovations,
      totalFunding: totalFunding[0]?.total || 0,
      investmentRequests,
      totalCommitments,
      investmentTrends,
      chats,
      notifications: recentNotifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching innovator stats",
      error: error.message,
    });
  }
};

// ✅ Handle Accept/Reject Investment Requests
exports.handleInvestmentRequest = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment)
      return res.status(404).json({ message: "Investment request not found" });

    investment.status = req.body.status;
    await investment.save();

    res.json({
      message: `Investment status updated to ${investment.status}`,
      investment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating investment status",
      error: error.message,
    });
  }
};

/**
 * Get all notifications for a given user.
 * Expects route parameters: userId and userType.
 *
 * Example route: GET /api/notifications/:userId/:userType
 */
// controllers/notifications.controller.js

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    // Convert role: first letter uppercase, rest lowercase.
    const userRole = req.user.role;
    const userType = userRole === "innovator" ? "Innovator" : "Investor";
    // userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase();

    // Allowed types (capitalized)
    const allowedTypes = ["Admin", "Innovator", "Investor"];
    // if (!allowedTypes.includes(userType)) {
    //   return res
    //     .status(400)
    //     .json({ success: false, error: "Invalid user type" });
    // }

    const notifications = await Notification.find({
      receiverId: userId,
      receiverType: "Innovator"//userType,
    }).sort({ createdAt: -1 });
    console.log("notify" + userType)
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching notifications",
    });
  }
};
