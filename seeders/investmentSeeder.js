const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Commitment = require("../models/commitment");
const Investor = require("../models/investor");
const Innovator = require("../models/innovator");
const Innovation = require("../models/innovation");
const Investment = require("../models/investment");
const Category = require("../models/category");
const bcrypt = require("bcryptjs");

require("dotenv").config();
const connectDB = require("../config/db");

// Ensure database connection
connectDB();

const seedInvestments = async () => {
  try {
    console.log("🔄 Fetching existing categories...");
    const categories = await Category.find();

    if (!categories.length) {
      console.log("❌ No categories found. Please add some categories first.");
      return;
    }
    console.log("✅ Categories fetched successfully!");

    console.log("🔄 Seeding new investors, innovators, innovations, and commitments...");

    // ✅ Step 1: Create 3 New Investors
    const hashedPassword = await bcrypt.hash("password123", 10);
    const investors = await Investor.insertMany(
      Array.from({ length: 3 }, () => ({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        bio: faker.lorem.paragraphs(2),
        city: faker.address.city(),
        education: faker.name.jobTitle(),
        password: hashedPassword,
        phone: faker.phone.number(),
        birthday: faker.date.past(30, new Date("2002-01-01")),
      }))
    );

    console.log("✅ Created 3 new investors!");

    // ✅ Step 2: Create 3 New Innovators
    const innovators = await Innovator.insertMany(
      Array.from({ length: 3 }, () => ({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        bio: faker.lorem.paragraphs(2),
        city: faker.address.city(),
        education: faker.name.jobTitle(),
        password: hashedPassword,
        phone: faker.phone.number(),
        birthday: faker.date.past(30, new Date("2002-01-01")),
      }))
    );

    console.log("✅ Created 3 new innovators!");

    // ✅ Step 3: Create 3 New Innovations with Categories
    const innovations = await Innovation.insertMany(
      Array.from({ length: 3 }, () => ({
        name: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        cost: faker.commerce.price(),
        details: faker.lorem.sentences(),
        createdBy: faker.helpers.arrayElement(innovators)._id, // Link to a new innovator
        category: faker.helpers.arrayElement(categories)._id, // ✅ Link innovation to a random category
      }))
    );

    console.log("✅ Created 3 new innovations with categories!");

    // ✅ Step 4: Create 3 New Commitments
    const commitments = await Commitment.insertMany(
      Array.from({ length: 3 }, () => ({
        conditions:  faker.lorem.paragraphs(20),
        investor: faker.helpers.arrayElement(investors)._id, // Link to a new investor
        innovator: faker.helpers.arrayElement(innovators)._id, // Link to a new innovator
      }))
    );

    console.log("✅ Created 3 new commitments!");

    // ✅ Step 5: Create 3 New Investments (Linking Everything)
    const investments = await Investment.insertMany(
      commitments.map((commitment) => ({
        commitment: commitment._id,
        innovation: faker.helpers.arrayElement(innovations)._id, // Ensure it links properly
      }))
    );

    console.log("✅ Successfully created investments!");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding investments:", error);
    process.exit(1);
  }
};

// Run the seeder
seedInvestments();
