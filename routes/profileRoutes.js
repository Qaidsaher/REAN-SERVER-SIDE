// const express = require("express");
// const router = express.Router();
// const userProfileController = require("../controllers/userProfileController");
// const userController = require("../controllers/userController");
// const authMiddleware = require("../middleware/authMiddleware");
// const upload = require("../middleware/multer");

// router.put("/", authMiddleware, upload.single("photo"), userProfileController.updateProfile);
// // ✅ Route to Get User Profile
// router.get("/", authMiddleware,userProfileController.getProfile);
// router.post("/change-password", authMiddleware, userProfileController.changePassword);
// // ✅ Delete Account Route (For both Innovators and Investors)
// router.delete("/delete-account", authMiddleware, userProfileController.deleteAccount);

// // dashboard of innovator 
// router.get("/dashboard", authMiddleware, userProfileController.dashboard);
// module.exports = router;

const express = require("express");
const router = express.Router();
const userProfileController = require("../controllers/userProfileController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

router.put("/", authMiddleware, upload.single("photo"), userProfileController.updateProfile);
// ✅ Route to Get User Profile
router.get("/", authMiddleware, userProfileController.getProfile);
router.post("/change-password", authMiddleware, userProfileController.changePassword);
// ✅ Delete Account Route (For both Innovators and Investors)
router.delete("/delete-account", authMiddleware, userProfileController.deleteAccount);
router.get("/notifications", authMiddleware, userProfileController.getNotifications)
// Dashboard of user (Investor/Innovator)
router.get("/dashboard", authMiddleware, userProfileController.dashboard);

// Investment and Commitment Management
router.post("/investments", authMiddleware, userProfileController.createInvestmentWithCommitment);
router.post("/commitments/conditions", authMiddleware, userProfileController.addCommitmentConditions);
router.post("/commitments/sign/investor", authMiddleware, userProfileController.signCommitmentInvestor);
router.post("/commitments/sign/innovator", authMiddleware, userProfileController.signCommitmentInnovator);
router.get("/commitments", authMiddleware, userProfileController.getUserCommitments);
router.get("/investments", authMiddleware, userProfileController.getUserInvestments);
// ✅ Fetch a specific commitment by ID
router.get("/commitments/:id", authMiddleware, userProfileController.getCommitmentById);
module.exports = router;
