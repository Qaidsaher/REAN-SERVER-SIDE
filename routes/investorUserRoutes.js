const express = require("express");
const router = express.Router();
const { getInvestors, getInvestorById,getInvestmentsByInvestor } = require("../controllers/users/investorUserController");

router.get("/", getInvestors);
router.get("/:id", getInvestorById);
router.get("/:id/investments", getInvestmentsByInvestor); // Get investments by investor
module.exports = router;
