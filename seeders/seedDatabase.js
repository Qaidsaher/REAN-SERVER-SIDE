// seeders/seed.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

// Import models (adjust the paths as needed)
const Admin = require("../models/admin");
const Category = require("../models/category");
const Chat = require("../models/chat");
const Commitment = require("../models/commitment");
const Innovation = require("../models/innovation");
const Innovator = require("../models/innovator");
const Investment = require("../models/investment");
const Investor = require("../models/investor");
const Message = require("../models/message");
const Notification = require("../models/notification");

// MongoDB connection URI – update with your credentials or local DB URL.
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/testdb";

// Connect to MongoDB (connection options are now no-ops with Node.js Driver v4+)
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function seedData() {
  try {
    // Clear existing data in all collections
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Chat.deleteMany({});
    await Commitment.deleteMany({});
    await Innovation.deleteMany({});
    await Innovator.deleteMany({});
    await Investment.deleteMany({});
    await Investor.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    console.log("Cleared all collections.");

    // -------------------------------------------------------------------------
    // Create Admins (1 primary + 2 additional)
    // -------------------------------------------------------------------------
    const adminPassword = await bcrypt.hash("password123", 10);
    const adminSaher = await Admin.create({
      name: faker.person.fullName(),
      email: "saher@gmail.com",
      state: faker.location.state(),
      password: adminPassword,
    });
    console.log("Primary Admin created:", adminSaher.email);

    const adminsFake = [];
    for (let i = 0; i < 2; i++) {
      const adminFake = await Admin.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        state: faker.location.state(),
        password: adminPassword,
      });
      adminsFake.push(adminFake);
    }
    console.log("Additional Admins created:", adminsFake.length);

    // -------------------------------------------------------------------------
    // Create Categories (associated with the primary admin)
    // -------------------------------------------------------------------------
    const categories = [];
    for (let i = 0; i < 3; i++) {
      const cat = await Category.create({
        name: faker.commerce.department(),
        createdBy: adminSaher._id,
      });
      categories.push(cat);
    }
    console.log("Categories created:", categories.length);

    // -------------------------------------------------------------------------
    // Create Innovators (1 primary + 5 additional)
    // -------------------------------------------------------------------------
    const innovatorPassword = await bcrypt.hash("password123", 10);
    const innovatorSaher = await Innovator.create({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      bio: faker.lorem.sentence(),
      email: "saher@gmail.com",
      city: faker.location.city(),
      education: faker.person.jobTitle(),
      password: innovatorPassword,
      photo: faker.image.avatar(),
      phone: faker.phone.number(),
      birthday: faker.date.past(30, new Date("2000-01-01")),
      accountX: faker.string.alphanumeric(10),
    });
    console.log("Primary Innovator created:", innovatorSaher.email);

    const innovatorsFake = [];
    for (let i = 0; i < 5; i++) {
      const innovatorFake = await Innovator.create({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        bio: faker.lorem.sentence(),
        email: faker.internet.email(),
        city: faker.location.city(),
        education: faker.person.jobTitle(),
        password: innovatorPassword,
        photo: faker.image.avatar(),
        phone: faker.phone.number(),
        birthday: faker.date.past(30, new Date("2000-01-01")),
        accountX: faker.string.alphanumeric(10),
      });
      innovatorsFake.push(innovatorFake);
    }
    console.log("Additional Innovators created:", innovatorsFake.length);

    // Combine all innovators in one array for later use.
    const allInnovators = [innovatorSaher, ...innovatorsFake];

    // -------------------------------------------------------------------------
    // Create Investors (1 primary + 3 additional)
    // -------------------------------------------------------------------------
    const investorPassword = await bcrypt.hash("password123", 10);
    const investorSaher = await Investor.create({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: "saher@gmail.com",
      bio: faker.lorem.sentence(),
      city: faker.location.city(),
      education: faker.person.jobTitle(),
      password: investorPassword,
      photo: faker.image.avatar(),
      phone: faker.phone.number(),
      birthday: faker.date.past(30, new Date("2000-01-01")),
    });
    console.log("Primary Investor created:", investorSaher.email);

    const investorsFake = [];
    for (let i = 0; i < 3; i++) {
      const investorFake = await Investor.create({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        bio: faker.lorem.sentence(),
        city: faker.location.city(),
        education: faker.person.jobTitle(),
        password: investorPassword,
        photo: faker.image.avatar(),
        phone: faker.phone.number(),
        birthday: faker.date.past(30, new Date("2000-01-01")),
      });
      investorsFake.push(investorFake);
    }
    console.log("Additional Investors created:", investorsFake.length);

    // Combine all investors in one array for later use.
    const allInvestors = [investorSaher, ...investorsFake];

    // -------------------------------------------------------------------------
    // Create Innovations (5 records)
    // -------------------------------------------------------------------------
    const innovations = [];
    for (let i = 0; i < 5; i++) {
      const innovation = await Innovation.create({
        name: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        cost: parseFloat(faker.commerce.price()),
        details: faker.lorem.paragraphs(),
        status: "Pending",
        image: faker.image.url(),
        video: faker.internet.url(),
        category: faker.helpers.arrayElement(categories)._id,
        createdBy: faker.helpers.arrayElement(allInnovators)._id,
      });
      innovations.push(innovation);
    }
    console.log("Innovations created:", innovations.length);

    // -------------------------------------------------------------------------
    // Create Chats (create a chat between each primary innovator & investor)
    // -------------------------------------------------------------------------
    const chat = await Chat.create({
      innovator: innovatorSaher._id,
      investor: investorSaher._id,
    });
    console.log("Chat created between primary innovator and investor.");

    // -------------------------------------------------------------------------
    // Create Commitments (create 3 records)
    // -------------------------------------------------------------------------
    const commitments = [];
    for (let i = 0; i < 3; i++) {
      const commitment = await Commitment.create({
        conditions: faker.lorem.sentence(),
        milestones: [faker.lorem.word(), faker.lorem.word()],
        investor: faker.helpers.arrayElement(allInvestors)._id,
        innovator: faker.helpers.arrayElement(allInnovators)._id,
        investorSign: false,
        innovatorSign: false,
        status: "Pending",
      });
      commitments.push(commitment);
    }
    console.log("Commitments created:", commitments.length);

    // -------------------------------------------------------------------------
    // Create Investments (create 5 records)
    // -------------------------------------------------------------------------
    const investments = [];
    for (let i = 0; i < 5; i++) {
      const investment = await Investment.create({
        investor: faker.helpers.arrayElement(allInvestors)._id,
        innovator: faker.helpers.arrayElement(allInnovators)._id,
        innovation: faker.helpers.arrayElement(innovations)._id,
        commitment: faker.helpers.arrayElement(commitments)._id,
        amount: parseFloat(faker.finance.amount()),
        status: "Active",
        paymentSchedule: [
          {
            dueDate: faker.date.soon(),
            amountDue: parseFloat(faker.finance.amount()),
            status: "Pending",
          },
        ],
      });
      investments.push(investment);
    }
    console.log("Investments created:", investments.length);

    // -------------------------------------------------------------------------
    // Create Messages in Chat (create 3 messages)
    // -------------------------------------------------------------------------
    const message = await Message.create({
      chatId: chat._id,
      sender: innovatorSaher._id,
      senderType: "Innovator",
      content: faker.lorem.sentence(),
      status: "Unread",
    });
    console.log("Message created in chat.");

    // -------------------------------------------------------------------------
    // Create Notifications for ALL users (Admins, Innovators, and Investors)
    // -------------------------------------------------------------------------
    const notifications = [];
    // For each admin (primary + fake)
    const allAdmins = [adminSaher, ...adminsFake];
    allAdmins.forEach((admin) => {
      notifications.push({
        title: faker.lorem.words(3),
        content: "Notification for Admin " + admin.email,
        senderType: "Admin",
        senderId: adminSaher._id, // assume primary admin sends these
        receiverType: "Admin",
        receiverId: admin._id,
        type: "System",
        status: "Info",
      });
    });
    // For each innovator
    allInnovators.forEach((innovator) => {
      notifications.push({
        title: faker.lorem.words(3),
        content: "Notification for Innovator " + innovator.email,
        senderType: "Admin",
        senderId: adminSaher._id,
        receiverType: "Innovator",
        receiverId: innovator._id,
        type: "System",
        status: "Info",
      });
    });
    // For each investor
    allInvestors.forEach((investor) => {
      notifications.push({
        title: faker.lorem.words(3),
        content: "Notification for Investor " + investor.email,
        senderType: "Admin",
        senderId: adminSaher._id,
        receiverType: "Investor",
        receiverId: investor._id,
        type: "System",
        status: "Info",
      });
    });
    await Notification.insertMany(notifications);
    console.log("Notifications created for all users:", notifications.length);

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
