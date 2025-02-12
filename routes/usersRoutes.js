const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const Innovation = require("../models/innovation"); // Import Innovation Model
const upload = require("../middleware/multer");

// ✅ Innovations Routes
router.get("/innovator-dashboard", authMiddleware, userController.getInnovatorStats);
router.post("/innovator-dashboard-request/:id", authMiddleware, userController.handleInvestmentRequest);
router.get("/innovations", authMiddleware, userController.getUserInnovations);
router.get("/innovations-all", authMiddleware, userController.getInnovations);
router.post(
  "/innovations",
  authMiddleware,
  upload.fields([{ name: "image" }, { name: "video" }]),
  userController.createInnovation
);
router.put(
  "/innovations/:id",
  authMiddleware,
  upload.fields([{ name: "image" }, { name: "video" }]),
  userController.updateInnovation
);
router.delete(
  "/innovations/:id",
  authMiddleware,
  userController.deleteInnovation
);
// ✅ Get Innovation by ID
router.get("/innovations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const innovation = await Innovation.findById(id).populate(
      "category createdBy"
    );

    if (!innovation) {
      return res.status(404).json({ message: "Innovation not found" });
    }

    res.status(200).json(innovation);
  } catch (error) {
    console.error("❌ Error fetching innovation:", error);
    res
      .status(500)
      .json({ message: "Error fetching innovation", error: error.message });
  }
});


// ✅ Investment Routes
router.get("/investments", authMiddleware, userController.getUserInvestments);

// ✅ Categories Routes
router.get("/categories", userController.getCategories);

// ✅ Get all investors
router.get("/investors", authMiddleware, userController.getInvestors);
// ✅ Change Password Route (For both Innovators and Investors)

// ✅ Get an Innovator by ID

module.exports = router;
