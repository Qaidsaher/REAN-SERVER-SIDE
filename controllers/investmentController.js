// controllers/investmentController.js
const Investment = require("../models/investment");
// const Investment = require("../../models/investment");
const Innovator = require("../models/innovator");
const Investor = require("../models/investor");
const Innovation = require("../models/innovation");
const Commitment = require("../models/commitment");

exports.createInvestment = async (req, res) => {
  try {
    const { innovation, commitment } = req.body;
    const newInvestment = new Investment({ innovation, commitment });
    await newInvestment.save();
    res
      .status(201)
      .json({
        message: "Investment created successfully",
        investment: newInvestment,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find();
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvestmentById = async (req, res) => {
  // try {
  //     const investment = await Investment.findById(req.params.id);
  //     if (!investment) return res.status(404).json({ message: 'Investment not found' });
  //     res.json(investment);
  // } catch (error) {
  //     res.status(500).json({ error: error.message });
  // }
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
            select:
              "firstName lastName email company photo bio city education phone",
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
    res.status(200).json(investment);
  } catch (error) {
    console.error("❌ Error fetching investment:", error);
    res
      .status(500)
      .json({ message: "Failed to load investment details.", error });
  }
};

exports.updateInvestment = async (req, res) => {
  try {
    const updatedInvestment = await Investment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedInvestment)
      return res.status(404).json({ message: "Investment not found" });
    res.json({ message: "Investment updated successfully", updatedInvestment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteInvestment = async (req, res) => {
  try {
    const deletedInvestment = await Investment.findByIdAndDelete(req.params.id);
    if (!deletedInvestment)
      return res.status(404).json({ message: "Investment not found" });
    res.json({ message: "Investment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
