// controllers/investorController.js
const Investor = require('../models/investor');

exports.createInvestor = async (req, res) => {
    try {
        const { firstName, lastName, email, education, password, phone, birthday } = req.body;
        const newInvestor = new Investor({ firstName, lastName, email, education, password, phone, birthday });
        await newInvestor.save();
        res.status(201).json({ message: 'Investor created successfully', investor: newInvestor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllInvestors = async (req, res) => {
    try {
        const investors = await Investor.find();
        res.json(investors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getInvestorById = async (req, res) => {
    try {
        const investor = await Investor.findById(req.params.id);
        if (!investor) return res.status(404).json({ message: 'Investor not found' });
        res.json(investor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateInvestor = async (req, res) => {
    try {
        const updatedInvestor = await Investor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedInvestor) return res.status(404).json({ message: 'Investor not found' });
        res.json({ message: 'Investor updated successfully', updatedInvestor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteInvestor = async (req, res) => {
    try {
        const deletedInvestor = await Investor.findByIdAndDelete(req.params.id);
        if (!deletedInvestor) return res.status(404).json({ message: 'Investor not found' });
        res.json({ message: 'Investor deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
