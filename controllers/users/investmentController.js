const Investment = require("../../models/investment");
const Innovator = require("../../models/innovator");
const Investor = require("../../models/investor");
const Innovation = require("../../models/innovation");
const Commitment = require("../../models/commitment");

// ✅ Get All Investments with Full Relations
exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate({
        path: "investor",
        select:
          "firstName lastName email company photo bio city education phone",
      })
      .populate({
        path: "innovation",
        select: "name description cost image video status category createdBy",
        populate: {
          path: "category",
          select: "name",
        },
        populate: {
          path: "createdBy",
          select: "firstName lastName email bio city education phone photo",
        },
      })
      .populate({
        path: "commitment",
        select: "amount status",
      });

    console.log("investemtns : ", JSON.stringify(investments));

    if (!investments || investments.length === 0) {
      return res.status(404).json({ message: "No investments found." });
    }

    res.status(200).json(investments);
  } catch (error) {
    console.error("❌ Error fetching investments:", error);
    res.status(500).json({ message: "Failed to load investments." });
  }
};

const Investment = require("../models/investment");

exports.getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate({
        path: "innovation",
        select: "name description cost image video status category createdBy",
        populate: [
          {
            path: "category",
            select: "name",
          },
          {
            path: "createdBy",
            select: "firstName lastName email bio city education phone photo",
          },
        ],
      })
      .populate({
        path: "commitment",
        select: "conditions status",
        populate: [
          {
            path: "investor",
            select: "firstName lastName email company photo bio city education phone",
          },
          {
            path: "innovator",
            select: "firstName lastName email bio city education phone photo",
          },
        ],
      });

    if (!investment) {
      console.log("❌ Investment not found.");
      return res.status(404).json({ message: "Investment not found." });
    }

    console.log("✅ Investment Details Retrieved:\n", JSON.stringify(investment, null, 2)); // Pretty print for debugging

    res.status(200).json(investment);
  } catch (error) {
    console.error("❌ Error fetching investment:", error);
    res.status(500).json({ message: "Failed to load investment details.", error });
  }
};

