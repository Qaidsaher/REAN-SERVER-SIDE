const Investor = require("../../models/investor");
const Investment = require("../../models/investment");
const Commitment = require("../../models/commitment");

const Innovation = require("../../models/innovation");

// ✅ Get Investments by Investor ID
exports.getInvestmentsByInvestor = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the investor
    const investor = await Investor.findById(id);
    if (!investor) {
      return res.status(404).json({ message: "Investor not found" });
    }

    // Find all investments made by this investor
    const investments = await Investment.find({ investor: id })
      .populate({
        path: "innovation",
        select: "name description cost image createdBy",
        populate: {
          path: "createdBy",
          select: "firstName lastName email photo",
        },
      })
      .sort({ date: -1 }); // Sort by most recent investments

    res.status(200).json(investments);
  } catch (error) {
    console.error("❌ Error fetching investments by investor:", error);
    res.status(500).json({ message: "Error fetching investments", error: error.message });
  }
};

// ✅ Get All Investors
exports.getInvestors = async (req, res) => {
  try {
    const investors = await Investor.find().select("-password");
    res.status(200).json(investors);
  } catch (error) {
    console.error("❌ Error fetching investors:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Investor by ID (including investments & related innovations)


exports.getInvestorById = async (req, res) => {
  try {
    const investor = await Investor.findById(req.params.id).select("-password");

    if (!investor) {
      return res.status(404).json({ message: "Investor not found" });
    }

    // Fetch commitments related to the investor
    const commitments = await Commitment.find({ investor: req.params.id });

    if (!commitments.length) {
      return res.status(200).json({ investor, investments: [] });
    }

    // Extract commitment IDs
    const commitmentIds = commitments.map((commitment) => commitment._id);

    // Fetch investments linked to the investor via commitments
    const investments = await Investment.find({ commitment: { $in: commitmentIds } })
      .populate({
        path: "innovation",
        select: "name image cost status createdBy",
        populate: {
          path: "createdBy",
          select: "firstName lastName email",
        },
      })
      .populate({
        path: "commitment",
        select: "conditions status",
      })
      .exec();

    res.status(200).json({ investor, investments });
  } catch (error) {
    console.error("❌ Error fetching investor details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

