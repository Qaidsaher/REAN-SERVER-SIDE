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
    const investments = await Investment.find()
      .populate('investor')
      .populate('innovator')
      .populate('innovation')
      .populate('commitment');
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvestmentById = async (req, res) => {

  try {
    const investment = await Investment.findById(req.params.id)
      .populate('investor')
      .populate('innovator')
      .populate('innovation')
      .populate('commitment');
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
    const { id } = req.params;
    const { status } = req.body;


    const validStatuses = ['Active', 'Pending', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // Find the investment and populate commitment
    const investment = await Investment.findById(id)
      .populate('investor')
      .populate('innovator')
      .populate('innovation')
      .populate('commitment');

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found.' });
    }

    // Extract commitment ID
    const commitmentId = investment.commitment?._id;
    if (!commitmentId) {
      return res.status(404).json({ message: 'Commitment not found for this investment.' });
    }

    await Investment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    // Update the commitment status
    const updatedCommitment = await Commitment.findByIdAndUpdate(
      commitmentId,
      { status },
      { new: true }
    );


    // console.log('Updated Commitment:', updatedCommitment);

    // Refetch the updated investment to get the latest commitment status
    const updatedInvestment = await Investment.findById(id)
      .populate('investor')
      .populate('innovator')
      .populate('innovation')
      .populate('commitment');

    res.json({
      message: 'Investment and commitment status updated successfully.',
      updatedInvestment
    });

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
