// const jwt = require("jsonwebtoken");
// const Innovator = require("../models/innovator");
// const Investor = require("../models/investor");

// const authMiddleware = async (req, res, next) => {
//     try {
//         const authHeader = req.header("Authorization");
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ message: "Access Denied, No Token Provided" });
//         }

//         const token = authHeader.split(" ")[1]; // Extract token after 'Bearer'
//         const verified = jwt.verify(token, process.env.JWT_SECRET);

//         // ✅ Get Role from Headers if available, otherwise use the token
//         const roleFromHeader = req.headers["user-role"]; // Sent by frontend
//         const role = roleFromHeader ;//|| verified.role; // Prefer header role if available

//         console.log("🔑 Verified Token:", verified);
//         console.log("🛠️ User Role from Headers:", roleFromHeader);
//         console.log("🛠️ Final Role Used:", role);

//         let user;
//         if (role === "innovator") {
//             user = await Innovator.findById(verified.id).select("-password");
//         } else if (role === "investor") {
//             user = await Investor.findById(verified.id).select("-password");
//         } else {
//             return res.status(400).json({ message: "Invalid role specified" });
//         }

//         if (!user) {
//             return res.status(403).json({ message: "Unauthorized Access" });
//         }

//         req.user = user; // Attach user to request
//         req.role = role; // Attach role to request
//         next();
//     } catch (err) {
//         console.error("❌ Middleware Error:", err.message);
//         res.status(400).json({ message: "Invalid Token" });
//     }
// };

// module.exports = authMiddleware;
// const jwt = require("jsonwebtoken");
// const Innovator = require("../models/innovator");
// const Investor = require("../models/investor");
// const Admin = require("../models/admin"); // ✅ Import Admin model

// const authMiddleware = async (req, res, next) => {
//     try {
//         const authHeader = req.header("Authorization");
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ message: "Access Denied, No Token Provided" });
//         }

//         const token = authHeader.split(" ")[1]; // Extract token after 'Bearer'
//         const verified = jwt.verify(token, process.env.JWT_SECRET);

//         // ✅ Get Role from Headers if available, otherwise use the token
//         const roleFromHeader = req.headers["user-role"]; // Sent by frontend
//         const role = roleFromHeader; // Prefer header role if available

//         console.log("🔑 Verified Token:", verified);
//         console.log("🛠️ User Role from Headers:", roleFromHeader);
//         console.log("🛠️ Final Role Used:", role);

//         let user;
//         if (role === "innovator") {
//             user = await Innovator.findById(verified.id).select("-password");
//         } else if (role === "investor") {
//             user = await Investor.findById(verified.id).select("-password");
//         } else if (role === "admin") {
//             user = await Admin.findById(verified.id).select("-password");
//         } else {
//             return res.status(400).json({ message: "Invalid role specified" });
//         }

//         if (!user) {
//             return res.status(403).json({ message: "Unauthorized Access" });
//         }

//         req.user = user; // Attach user to request
//         req.role = role; // Attach role to request
//         next();
//     } catch (err) {
//         console.error("❌ Middleware Error:", err.message);
//         res.status(400).json({ message: "Invalid Token" });
//     }
// };

// module.exports = authMiddleware;
const jwt = require("jsonwebtoken");
const Innovator = require("../models/innovator");
const Investor = require("../models/investor");
const Admin = require("../models/admin");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access Denied, No Token Provided" });
        }

        const token = authHeader.split(" ")[1];
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        const roleFromHeader = req.headers["user-role"]; 
        const role = roleFromHeader || verified.role;

        let user;
        if (role === "admin") {
            user = await Admin.findById(verified.id).select("-password");
            if (!user) {
                return res.status(403).json({ message: "Unauthorized Access: Admin not found" });
            }
        } else if (role === "innovator") {
            user = await Innovator.findById(verified.id).select("-password");
        } else if (role === "investor") {
            user = await Investor.findById(verified.id).select("-password");
        } else {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        if (!user) {
            return res.status(403).json({ message: "Unauthorized Access: User not found" });
        }

        req.user = user;
        req.role = role;
        next();
    } catch (err) {
        console.error("❌ Middleware Error:", err.message);
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
