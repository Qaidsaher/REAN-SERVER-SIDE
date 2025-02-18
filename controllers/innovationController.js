
// controllers/innovationController.js
const Innovation = require('../models/innovation');

exports.createInnovation = async (req, res) => {
    try {
        const { name, description, cost, details, category, status, innovator } = req.body;
        let imagePath = null;
        let videoPath = null;

        if (req.files) {
            if (req.files["image"]) {
                imagePath = `/uploads/${req.files["image"][0].filename}`;
            }
            if (req.files["video"]) {
                videoPath = `/uploads/${req.files["video"][0].filename}`;
            }
        }

        const newInnovation = new Innovation({
            name,
            description,
            cost,
            details,
            status,
            image: imagePath, // Save the correct image path
            video: videoPath, // Save the correct video path
            category,
            createdBy: innovator, // Attach logged-in user
        });
        await newInnovation.save();
        res.status(201).json({ message: 'Innovation created successfully', innovation: newInnovation });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message });
    }
};

exports.updateInnovation = async (req, res) => {
    try {
        const { name, description, cost, details,status } = req.body;
        const updatedInnovation = await Innovation.findByIdAndUpdate(req.params.id, { name, description, cost, details,status }, { new: true });
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
