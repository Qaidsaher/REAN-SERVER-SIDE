// controllers/commitmentController.js
const Commitment = require('../models/commitment');

exports.createCommitment = async (req, res) => {
    try {
        const { conditions, investor, innovator, status } = req.body;
        const newCommitment = new Commitment({ conditions, investor, innovator, status });
        await newCommitment.save();
        res.status(201).json({ message: 'Commitment created successfully', commitment: newCommitment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCommitments = async (req, res) => {
    try {
        const commitments = await Commitment.find();
        res.json(commitments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCommitmentById = async (req, res) => {
    try {
        const commitment = await Commitment.findById(req.params.id);
        if (!commitment) return res.status(404).json({ message: 'Commitment not found' });
        res.json(commitment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCommitment = async (req, res) => {
    try {
        const updatedCommitment = await Commitment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCommitment) return res.status(404).json({ message: 'Commitment not found' });
        res.json({ message: 'Commitment updated successfully', updatedCommitment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCommitment = async (req, res) => {
    try {
        const deletedCommitment = await Commitment.findByIdAndDelete(req.params.id);
        if (!deletedCommitment) return res.status(404).json({ message: 'Commitment not found' });
        res.json({ message: 'Commitment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
