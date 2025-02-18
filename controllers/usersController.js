const Innovator = require('../models/innovator');
const Investor = require('../models/investor');
const bcrypt = require('bcryptjs');

// ✅ Get All Users (Both Innovators & Investors)
exports.getAllUsers = async (req, res) => {
  try {
    const innovators = await Innovator.find().select('-password');
    const investors = await Investor.find().select('-password');

    // Attach a userType field for each document
    const allUsers = [
      ...innovators.map((user) => ({ ...user._doc, userType: 'innovator' })),
      ...investors.map((user) => ({ ...user._doc, userType: 'investor' }))
    ];

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// ✅ Get User by ID
// Expect a query parameter "userType" (investor or innovator)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.query;

    let user;
    if (userType === 'innovator') {
      user = await Innovator.findById(id).select('-password');
    } else if (userType === 'investor') {
      user = await Investor.findById(id).select('-password');
    } else {
      // Fallback: Try finding in both collections
      user = await Innovator.findById(id).select('-password');
      if (!user) {
        user = await Investor.findById(id).select('-password');
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If userType was not provided, we determine it here
    const finalUserType = userType || (user.company ? "investor" : "innovator");

    res.status(200).json({ ...user._doc, userType: finalUserType });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

// ✅ Create User
// Expects the request body to include a "userType" field ("innovator" or "investor")
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const Model = userType === 'innovator' ? Innovator : Investor;
    const newUser = new Model({ firstName, lastName, email, password: hashedPassword, ...rest });
    await newUser.save();
    res.status(201).json({ message: `${userType} created successfully`, user: { ...newUser._doc, userType } });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};

// ✅ Update User
// Expects "userType" in the request body
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userType, ...updates } = req.body;
    const Model = userType === 'innovator' ? Innovator : Investor;
    const updatedUser = await Model.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User updated successfully", user: { ...updatedUser._doc, userType } });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

// ✅ Delete User
// Pass userType as a query parameter (or in the body) to know which model to use
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.query;
    const Model = userType === 'innovator' ? Innovator : Investor;
    const deletedUser = await Model.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};
