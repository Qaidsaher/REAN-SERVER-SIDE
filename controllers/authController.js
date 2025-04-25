
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Innovator = require('../models/innovator');
const Investor = require('../models/investor');
const Admin = require('../models/admin'); // ✅ Import Admin Model
const nodemailer = require('nodemailer');
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};




// ✅ Delete Account (Supports Admin, Innovator, Investor)
const deleteAccount = async (req, res) => {
    const { role, user } = req;

    let userModel;
    if (role === "innovator") userModel = Innovator;
    else if (role === "investor") userModel = Investor;
    else if (role === "admin") userModel = Admin;
    else return res.status(400).json({ message: "Invalid role specified" });

    try {
        await userModel.findByIdAndDelete(user.id);
        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("❌ [DeleteAccount] Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Google Login Handler with Debug Logs
const googleAuth = async (req, res) => {
    const { token, role } = req.body;

    console.log("🔍 [GoogleAuth] Received Request:", { token: token ? "✅ Token Provided" : "❌ No Token", role });

    if (!token || !role) {
        return res.status(400).json({ message: "Token and role are required" });
    }

    try {
        console.log("🔍 [GoogleAuth] Verifying Google Token...");
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "122534742627-5ln7qqg0q2r87drgrlqh6nn6lsc0pu6g.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;
        console.log("✅ [GoogleAuth] Google Token Verified:", { email, name, picture });

        let user;
        let userModel;

        if (role === "innovator") userModel = Innovator;
        else if (role === "investor") userModel = Investor;
        else return res.status(400).json({ message: "Invalid role" });

        user = await userModel.findOne({ email });

        if (!user) {
            console.log("🆕 [GoogleAuth] Creating new user...");
            user = await userModel.create({
                firstName: name.split(" ")[0],
                lastName: name.split(" ")[1] || "",
                email,
                googleId: payload.sub,
                googleProfilePic: picture,
                isGoogleAccount: true,
            });
        }

        const jwtToken = generateToken(user._id, role);
        res.json({ message: "Google Sign-In successful", token: jwtToken, user });

    } catch (error) {
        console.error("❌ [GoogleAuth] Authentication Error:", error);
        res.status(401).json({ message: "Invalid Google token" });
    }
};



// ✅ Register User (Admins are not registered via this method)
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, city, education, phone, birthday, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role || !phone || !birthday) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        let user;
        if (role === "innovator") {
            user = await Innovator.create({ firstName, lastName, email, password: hashedPassword, city, education, phone, birthday, bio: "" });
        } else if (role === "investor") {
            user = await Investor.create({ firstName, lastName, email, password: hashedPassword, city, education, phone, birthday, bio: "" });
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }

        const token = generateToken(user._id, role);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role
            }
        });
    } catch (error) {
        res.status(400).json({ message: "User already exists or invalid data" });
    }
};

// ✅ Login User (Supports Admin, Innovator, Investor)
const loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    let user;
    if (role === "innovator") {
        user = await Innovator.findOne({ email });
    } else if (role === "investor") {
        user = await Investor.findOne({ email });
    } else if (role === "admin") {
        user = await Admin.findOne({ email });
    } else {
        return res.status(400).json({ message: "Invalid role specified" });
    }
    // console.log("login", password);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials s" });
    }

    const token = generateToken(user._id, role);

    res.json({
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name || undefined, // ✅ Admins use "name" instead of first & last name
            firstName: user.firstName || user.name,
            lastName: user.lastName || user.name,
            email: user.email,
            role
        }
    });
};

// ✅ Get Authenticated User (Supports Admin)
const getMe = async (req, res) => {
    try {
        if (!req.user || !req.role) {
            return res.status(400).json({ message: "Invalid Request: User not authenticated" });
        }

        res.json({
            id: req.user._id,
            name: req.user.name || undefined, // ✅ Admins have "name" instead
            firstName: req.user.firstName || undefined,
            lastName: req.user.lastName || undefined,
            email: req.user.email,
            role: req.role
        });
    } catch (error) {
        console.error("❌ GetMe Error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Logout User
const logoutUser = (req, res) => {
    res.json({ message: 'Logged out' });
};

// ✅ Change Password (Supports Admin)
// const changePassword = async (req, res) => {
//     const { oldPassword, newPassword } = req.body;

//     let user;
//     if (req.role === 'innovator') {
//         user = await Innovator.findById(req.user.id);
//     } else if (req.role === 'investor') {
//         user = await Investor.findById(req.user.id);
//     } else if (req.role === 'admin') {
//         user = await Admin.findById(req.user.id);
//     } else {
//         return res.status(400).json({ message: "Invalid role specified" });
//     }

//     if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
//         return res.status(400).json({ message: 'Old password is incorrect' });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);
//     await user.save();

//     res.json({ message: 'Password changed successfully' });
// };
// const bcrypt = require('bcryptjs'); // Ensure this is imported

// ✅ Change Password (Supports Admin)
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {

            return res.status(400).json({ message: "Old and new passwords are required" });
        }

        let user;
        if (req.role === 'innovator') {
            user = await Innovator.findById(req.user.id);
        } else if (req.role === 'investor') {
            user = await Investor.findById(req.user.id);
        } else if (req.role === 'admin') {
            user = await Admin.findById(req.user.id);
        } else {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        if (!user || typeof user.password !== 'string') {
            return res.status(400).json({ message: "User not found or password invalid" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Utility function to get user by role
const getUserByRole = async (role, query) => {
    console.log("[DEBUG] Role:", role);
    console.log("[DEBUG] Query:", query);
    switch (role) {
        case 'innovator':
            return await Innovator.findOne(query);
        case 'investor':
            return await Investor.findOne(query);
        case 'admin':
            return await Admin.findOne(query);
        default:
            console.error("[ERROR] Invalid role provided:", role);
            throw new Error("Invalid role specified");
    }
};


// ✅ Forgot Password (Supports Admin & Others)
const forgotPassword = async (req, res) => {
    const { email, role } = req.body;
    console.log("[DEBUG] Received email:", email);
    console.log("[DEBUG] Received role:", role);

    try {
        // Validate inputs
        if (!email || !role) {
            console.log("[DEBUG] Missing email or role:", { email, role });
            return res.status(400).json({ message: 'Email and role are required' });
        }

        // Get user
        const user = await getUserByRole(role, { email });
        if (!user) {
            console.log("[DEBUG] User not found for:", { email, role });
            return res.status(400).json({ message: 'User not found' });
        }

        // Generate and hash reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetToken = hashedToken;
        user.resetTokenExpires = Date.now() + 3600000; // Valid for 1 hour
        await user.save();

        console.log("[DEBUG] Generated token:", resetToken);
        console.log("[DEBUG] Hashed token saved:", hashedToken);

        // Construct and send the reset link
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&role=${role}`;
        console.log("[DEBUG] Reset link:", resetLink);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {

                // user: process.env.EMAIL_USER,
                // pass: process.env.EMAIL_PASS
                user: "Rean63434@gmail.com",
                pass: "cvhphuadqlygbyvm"

            }
        });

        await transporter.sendMail({
            to: user.email,
            // from: process.env.EMAIL_USER,
            from: "Rean63434@gmail.com",
            subject: 'Password Reset',
            text: `You requested a password reset. Click the link below:\n\n${resetLink}\n\nThis link is valid for 1 hour.`
        });

        console.log("[DEBUG] Password reset link sent to:", user.email);
        res.json({ message: 'Password reset link sent to your email' });

    } catch (error) {
        console.error("[ERROR] forgotPassword error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
// ✅ Update Admin Profile (Admin only)
const updateAdminProfile = async (req, res) => {
    const { name, email } = req.body;

    // Verify that the request is coming from an admin
    if (req.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Validate input
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required." });
    }

    try {
        // Optionally: Check if the provided email is already used by another admin
        const existingAdmin = await Admin.findOne({ email, _id: { $ne: req.user._id } });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email is already in use by another admin." });
        }

        // Update the admin document with new name and email
        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true }
        );

        if (!updatedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json({ message: "Admin profile updated successfully", admin: updatedAdmin });
    } catch (error) {
        console.error("❌ [UpdateAdminProfile] Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ✅ Reset Password (Supports Admin & Others)
const resetPassword = async (req, res) => {
    const { token, newPassword, role } = req.body;

    console.log("[DEBUG] Incoming request:", { token, newPassword, role });

    try {
        // Validate inputs
        if (!token || !newPassword || !role) {
            console.log("[DEBUG] Missing fields:", { token, newPassword, role });
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Hash the token before lookup
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        console.log("[DEBUG] Hashed token for lookup:", hashedToken);

        // Find the user
        const user = await getUserByRole(role, {
            resetToken: hashedToken,
            resetTokenExpires: { $gt: Date.now() }
        });

        console.log("[DEBUG] User found:", user ? user.email : "No user found");

        if (!user) {
            console.log("[DEBUG] User lookup failed. Invalid or expired token:", { hashedToken, role });
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Validate password length
        if (newPassword.length < 6) {
            console.log("[DEBUG] Password too short:", newPassword);
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("[DEBUG] Hashed new password:", hashedPassword);

        // Update password and clear reset fields
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();

        console.log("[DEBUG] Password reset successful for user:", user.email);
        res.json({ message: 'Password reset successful' });

    } catch (error) {
        console.error("[ERROR] resetPassword error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = {
    updateAdminProfile,
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword,
    googleAuth,
    deleteAccount
};
