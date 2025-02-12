// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const crypto = require('crypto');
// const Innovator = require('../models/innovator');
// const Investor = require('../models/investor');
// const nodemailer = require('nodemailer');

// const generateToken = (id, role) => {
//     return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
// };

// // ✅ Register User (Fix Role Handling)
// const registerUser = async (req, res) => {
//     const { firstName, lastName, email, password, city, education, phone, birthday,role } = req.body;
//     // const role = req.headers["user-role"]; // ✅ Read role from headers

//     if (!firstName || !lastName || !email || !password || !role || !phone || !birthday) {
//         return res.status(400).json({ message: "Please provide all required fields" });
//     }

//     try {
//         // ✅ Hash the password before saving
//         const hashedPassword = await bcrypt.hash(password, 10);

//         let user;
//         if (role === "innovator") {
//             user = await Innovator.create({ firstName, lastName, email, password: hashedPassword, city, education, phone, birthday ,bio:""});
//         } else if (role === "investor") {
//             user = await Investor.create({ firstName, lastName, email, password: hashedPassword,city, education, phone, birthday ,bio:""});
//         } else {
//             return res.status(400).json({ message: "Invalid role" });
//         }

//         // ✅ Generate token with correct role
//         const token = generateToken(user._id, user.role);

//         res.status(201).json({
//             message: "User registered successfully",
//             token,
//             user: {
//                 id: user._id,
//                 firstName: user.firstName,
//                 lastName: user.lastName,
//                 email: user.email,
//                 role: role
//             }
//         });
//     } catch (error) {
//         res.status(400).json({ message: "User already exists or invalid data" });
//     }
// };

// // ✅ Login User (Ensure Role is Passed)
// const loginUser = async (req, res) => {
//     const { email, password, role } = req.body;

//     let user;
//     if (role === "innovator") {
//         user = await Innovator.findOne({ email });
//     } else if (role === "investor") {
//         user = await Investor.findOne({ email });
//     }

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//         return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // ✅ Generate token with correct role
//     const token = generateToken(user._id, user.role);

//     res.json({
//         message: "Login successful",
//         token,
//         user: {
//             id: user._id,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             email: user.email,
//             role: user.role
//         }
//     });
// };

// // ✅ Get Authenticated User (Fix Role Handling)
// const getMe = async (req, res) => {
//     try {
//         if (!req.user || !req.role) {
//             return res.status(400).json({ message: "Invalid Request: User not authenticated" });
//         }

//         res.json({
//             id: req.user._id,
//             firstName: req.user.firstName,
//             lastName: req.user.lastName,
//             email: req.user.email,
//             role: req.role
//         });
//     } catch (error) {
//         console.error("❌ GetMe Error:", error.message);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// // Logout User
// const logoutUser = (req, res) => {
//     res.json({ message: 'Logged out' });
// };


// // Change Passwor
// const changePassword = async (req, res) => {
//     const { oldPassword, newPassword } = req.body;

//     let user;
//     if (req.user.role === 'innovator') {
//         user = await Innovator.findById(req.user.id);
//     } else {
//         user = await Investor.findById(req.user.id);
//     }

//     if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
//         return res.status(400).json({ message: 'Old password is incorrect' });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);
//     await user.save();

//     res.json({ message: 'Password changed successfully' });
// };

// // Forgot Password (Send Reset Token)
// const forgotPassword = async (req, res) => {
//     const { email, role } = req.body;

//     let user;
//     if (role === 'innovator') {
//         user = await Innovator.findOne({ email });
//     } else {
//         user = await Investor.findOne({ email });
//     }

//     if (!user) {
//         return res.status(400).json({ message: 'User not found' });
//     }

//     const resetToken = crypto.randomBytes(20).toString('hex');
//     user.resetToken = resetToken;
//     user.resetTokenExpires = Date.now() + 3600000; // 1 hour
//     await user.save();

//     // Send email
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
//     });

//     const mailOptions = {
//         to: user.email,
//         from: process.env.EMAIL_USER,
//         subject: 'Password Reset',
//         text: `You requested a password reset. Click the link below:\n\n${process.env.CLIENT_URL}/reset-password/${resetToken}`
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({ message: 'Password reset link sent to your email' });
// };

// // Reset Password
// const resetPassword = async (req, res) => {
//     const { token, newPassword, role } = req.body;

//     let user;
//     if (role === 'innovator') {
//         user = await Innovator.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
//     } else {
//         user = await Investor.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
//     }

//     if (!user) {
//         return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);
//     user.resetToken = undefined;
//     user.resetTokenExpires = undefined;
//     await user.save();

//     res.json({ message: 'Password reset successful' });
// };

// module.exports = {
//     registerUser,
//     loginUser,
//     logoutUser,
//     getMe,
//     changePassword,
//     forgotPassword,
//     resetPassword
// };
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Innovator = require('../models/innovator');
const Investor = require('../models/investor');
const Admin = require('../models/admin'); // ✅ Import Admin Model
const nodemailer = require('nodemailer');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
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

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
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
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

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

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
        return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
};

// ✅ Forgot Password (Supports Admin)
const forgotPassword = async (req, res) => {
    const { email, role } = req.body;

    let user;
    if (role === 'innovator') {
        user = await Innovator.findOne({ email });
    } else if (role === 'investor') {
        user = await Investor.findOne({ email });
    } else if (role === 'admin') {
        user = await Admin.findOne({ email });
    } else {
        return res.status(400).json({ message: "Invalid role specified" });
    }

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        text: `You requested a password reset. Click the link below:\n\n${process.env.CLIENT_URL}/reset-password/${resetToken}`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password reset link sent to your email' });
};

// ✅ Reset Password (Supports Admin)
const resetPassword = async (req, res) => {
    const { token, newPassword, role } = req.body;

    let user;
    if (role === 'innovator') {
        user = await Innovator.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    } else if (role === 'investor') {
        user = await Investor.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    } else if (role === 'admin') {
        user = await Admin.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    } else {
        return res.status(400).json({ message: "Invalid role specified" });
    }

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword
};
