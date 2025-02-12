const express = require("express");
const router = express.Router();
const { getInvestments, getInvestmentById } = require("../controllers/users/investmentController");

// ✅ Get all investments
router.get("/", getInvestments);

// ✅ Get a single investment by ID
router.get("/:id", getInvestmentById);

module.exports = router;
