// // models/investor.js

// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const investorSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   bio: { type: String, default: "" },
//   city: { type: String, default: "unknown"  },
//   education: { type: String },
//   password: { type: String, required: false },
//   photo: { type: String },
//   phone: { type: String, required: false },
//   birthday: { type: Date, required: false },
//   publishDate: { type: Date, default: Date.now },
//   resetToken: String,                      // Token for password reset
//   resetTokenExpires: Date      
// });
// module.exports = mongoose.model("Investor", investorSchema);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const investorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String, default: "" },
    city: { type: String, default: "unknown" },
    education: { type: String },
    password: { type: String, required: false }, // Password is optional for Google accounts
    photo: { type: String },
    phone: { type: String, required: false },
    birthday: { type: Date, required: false },
    publishDate: { type: Date, default: Date.now },

    // ✅ Google Authentication Fields
    googleId: { type: String, unique: true, sparse: true }, // Unique Google ID for OAuth
    googleProfilePic: { type: String }, // Stores Google profile picture
    isGoogleAccount: { type: Boolean, default: false }, // Flag to identify Google users

    // ✅ Password Reset Fields
    resetToken: String,
    resetTokenExpires: Date,
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt automatically
);

// ✅ Hash password before saving (Only if password is provided)
investorSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// ✅ Compare password method
investorSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Investor", investorSchema);
