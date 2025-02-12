// // middleware/authAdminMiddleware.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
require("dotenv").config();

// const authAdminMiddleware = async (req, res, next) => {
//     try {
//         const authHeader = req.header('Authorization');
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return res.status(401).json({ message: 'Access Denied, No Token Provided' });
//         }

//         const token = authHeader.split(' ')[1]; // Extract token after 'Bearer'
//         const verified = jwt.verify(token, process.env.JWT_SECRET);
//         const admin = await Admin.findById(verified.id);

//         if (!admin) return res.status(403).json({ message: 'Unauthorized' });

//         req.admin = admin;
//         next();
//     } catch (err) {
//         res.status(400).json({ message: 'Invalid Token' });
//     }
// };
// module.exports = authAdminMiddleware;
const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access Denied, No Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const roleFromHeader = req.headers["user-role"];
    const role = roleFromHeader || verified.role;

    let user;
    if (role === "admin") {
      user = await Admin.findById(verified.id).select("-password");
      if (!user) {
        return res
          .status(403)
          .json({ message: "Unauthorized Access: Admin not found" });
      }
    }

    if (!user) {
      return res
        .status(403)
        .json({ message: "Unauthorized Access: User not found" });
    }

    req.user = user;
    req.role = role;
    next();
  } catch (err) {
    console.error("❌ Middleware Error:", err.message);
    res.status(400).json({ message: "Invalid Token" });
  } // ✅ Proceed if the user is an admin
};

module.exports = adminMiddleware;
