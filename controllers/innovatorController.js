// controllers/innovatorController.js
const Innovator = require('../models/innovator');

exports.createInnovator = async (req, res) => {
    try {
        const { firstName, lastName, email, bio, city, education, password, phone, birthday } = req.body;
        const newInnovator = new Innovator({ firstName, lastName, email, bio, city, education, password, phone, birthday });
        await newInnovator.save();
        res.status(201).json({ message: 'Innovator created successfully', innovator: newInnovator });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllInnovators = async (req, res) => {
    try {
        const innovators = await Innovator.find();
        res.json(innovators);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getInnovatorById = async (req, res) => {
    try {
        const innovator = await Innovator.findById(req.params.id);
        if (!innovator) return res.status(404).json({ message: 'Innovator not found' });
        res.json(innovator);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateInnovator = async (req, res) => {
    try {
        const updatedInnovator = await Innovator.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedInnovator) return res.status(404).json({ message: 'Innovator not found' });
        res.json({ message: 'Innovator updated successfully', updatedInnovator });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteInnovator = async (req, res) => {
    try {
        const deletedInnovator = await Innovator.findByIdAndDelete(req.params.id);
        if (!deletedInnovator) return res.status(404).json({ message: 'Innovator not found' });
        res.json({ message: 'Innovator deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
