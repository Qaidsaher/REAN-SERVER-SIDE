
// controllers/innovationController.js
const Innovation = require('../models/innovation');

exports.createInnovation = async (req, res) => {
    try {
        const { name, description, cost, details, category } = req.body;
        const newInnovation = new Innovation({ name, description, cost, details, category, createdBy: req.admin._id });
        await newInnovation.save();
        res.status(201).json({ message: 'Innovation created successfully', innovation: newInnovation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateInnovation = async (req, res) => {
    try {
        const { name, description, cost, details } = req.body;
        const updatedInnovation = await Innovation.findByIdAndUpdate(req.params.id, { name, description, cost, details }, { new: true });
        if (!updatedInnovation) return res.status(404).json({ message: 'Innovation not found' });
        res.json({ message: 'Innovation updated successfully', updatedInnovation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteInnovation = async (req, res) => {
    try {
        const deletedInnovation = await Innovation.findByIdAndDelete(req.params.id);
        if (!deletedInnovation) return res.status(404).json({ message: 'Innovation not found' });
        res.json({ message: 'Innovation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllInnovations = async (req, res) => {
    try {
        const innovations = await Innovation.find().populate('category');
        res.json(innovations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getInnovationById = async (req, res) => {
    try {
        const innovation = await Innovation.findById(req.params.id).populate('category');
        if (!innovation) return res.status(404).json({ message: 'Innovation not found' });
        res.json(innovation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
