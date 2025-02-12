const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/db");

// Import all models
const Admin = require("../models/admin");
const Innovator = require("../models/innovator");
const Investor = require("../models/investor");
const Category = require("../models/category");
const Innovation = require("../models/innovation");
const Commitment = require("../models/commitment");
const Investment = require("../models/investment");
const Notification = require("../models/notification");
const Chatting = require("../models/chatting");
const Chat = require("../models/chat");
const Message = require("../models/message");

// Ensure database connection
connectDB();

const refreshDatabase = async () => {
  try {
    console.log("🚨 Refreshing Database... Removing all records...");

    // // Delete all records from collections
    // await Admin.deleteMany();
    // await Innovator.deleteMany();
    // await Investor.deleteMany();
    // await Category.deleteMany();
    await Innovation.deleteMany();
    await Commitment.deleteMany();
    await Investment.deleteMany();
    await Notification.deleteMany();
    // await Chatting.deleteMany();
    // await Chat.deleteMany();
    // await Message.deleteMany();

    console.log("✅ All collections cleared successfully!");

    console.log("🔄 Running Seeder to Repopulate Database...");
    const seedInvestments = require("./refreshDatabase"); // Run the existing seeder
    await seedInvestments;

    console.log("✅ Database refreshed and seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error refreshing database:", error);
    process.exit(1);
  }
};

// Run the refresh script
refreshDatabase();
