// seeders/seedDatabase.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const Admin = require("../models/admin");
const Innovator = require("../models/innovator");
const Investor = require("../models/investor");
const Category = require("../models/category");
const Innovation = require("../models/innovation");
const Commitment = require("../models/commitment");
const Investment = require("../models/investment");
const Notification = require("../models/notification");
const Chatting = require("../models/chatting");
const Chat = require("../models/chat"); // ✅ Updated: Chat model
const Message = require("../models/message"); // ✅ Updated: Message model
require("dotenv").config();

const connectDB = require("../config/db");
connectDB();

const seedData = async () => {
  try {
    await Admin.deleteMany();
    await Innovator.deleteMany();
    await Investor.deleteMany();
    await Category.deleteMany();
    await Innovation.deleteMany();
    await Commitment.deleteMany();
    await Investment.deleteMany();
    await Notification.deleteMany();
    await Chatting.deleteMany();
    await Chat.deleteMany(); // ✅ Delete old chat records
    await Message.deleteMany(); // ✅ Delete old messages
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const admin = new Admin({
      name: "Saher",
      email: "saher@gmail.com",
      password: hashedPassword,
    });
    await admin.save();

    const categories = await Category.insertMany(
      Array.from({ length: 5 }, () => ({
        name: faker.commerce.department(),
        createdBy: admin._id,
      }))
    );

    const innovators = await Innovator.insertMany(
      Array.from({ length: 10 }, () => ({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        bio: faker.lorem.paragraphs(2), // ✅ Random Bio (2 paragraphs)        city: f
        city: faker.address.city(),
        education: faker.name.jobTitle(),
        password: hashedPassword,
        phone: faker.phone.number(),
        birthday: faker.date.past(30, new Date("2002-01-01")),
      }))
    );

    const investors = await Investor.insertMany(
      Array.from({ length: 5 }, () => ({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        bio: faker.lorem.paragraphs(2), // ✅ Random Bio (2 paragraphs)
        city: faker.address.city(),
        education: faker.name.jobTitle(),
        password: hashedPassword,
        phone: faker.phone.number(),
        birthday: faker.date.past(30, new Date("2002-01-01")),
      }))
    );

    const innovations = await Innovation.insertMany(
      Array.from({ length: 10 }, () => ({
        name: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        cost: faker.commerce.price(),
        details: faker.lorem.sentences(),
        category: faker.helpers.arrayElement(categories)._id,
        createdBy: faker.helpers.arrayElement(innovators)._id,
      }))
    );

    const commitments = await Commitment.insertMany(
      Array.from({ length: 5 }, () => ({
        conditions: faker.lorem.sentence(),
        investor: faker.helpers.arrayElement(investors)._id,
        innovator: faker.helpers.arrayElement(innovators)._id,
      }))
    );

    const investments = await Investment.insertMany(
      Array.from({ length: 5 }, () => ({
        innovation: faker.helpers.arrayElement(innovations)._id,
        commitment: faker.helpers.arrayElement(commitments)._id,
      }))
    );

    const notifications = await Notification.insertMany(
      Array.from({ length: 5 }, () => ({
        content: faker.lorem.sentence(),
        name: faker.lorem.word(),
        type: "info",
        receiver: faker.helpers.arrayElement(innovators)._id,
      }))
    );

    const chatMessages = await Chatting.insertMany(
      Array.from({ length: 5 }, () => ({
        sender: faker.helpers.arrayElement(investors)._id,
        receiver: faker.helpers.arrayElement(innovators)._id,
        message: faker.lorem.sentence(),
        status: "unread",
      }))
    );

    // ✅ Create Unique Chat Pairs
    const chatPairs = new Set();
    while (chatPairs.size < 5) {
      const innovator = faker.helpers.arrayElement(innovators);
      const investor = faker.helpers.arrayElement(investors);
      const pairKey = `${innovator._id}-${investor._id}`;

      if (!chatPairs.has(pairKey)) {
        chatPairs.add(pairKey);
      }
    }

    const chatArray = Array.from(chatPairs).map((pair) => {
      const [innovatorId, investorId] = pair.split("-");
      return {
        innovator: innovatorId,
        investor: investorId,
      };
    });

    const chats = await Chat.insertMany(chatArray);

    // ✅ Create Fake Messages for Each Chat
    for (let chat of chats) {
      for (let i = 0; i < 3; i++) {
        await Message.create({
          chatId: chat._id,
          sender: i % 2 === 0 ? chat.innovator : chat.investor,
          senderType: i % 2 === 0 ? "Innovator" : "Investor",
          content: faker.lorem.sentence(),
          status: "Unread",
          timestamp: faker.date.recent(),
        });
      }
    }

    console.log("✅ Database seeded successfully!");

    console.log("Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
