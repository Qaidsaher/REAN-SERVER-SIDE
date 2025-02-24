
// controllers/innovationController.js
const Innovation = require('../models/innovation');
const path = require('path');
const fs = require('fs');
exports.createInnovation = async (req, res) => {
    try {
        const { name, description, cost, details, category, status, innovator } = req.body;
        const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

        // Handle File Uploads (If Provided)
        let imagePath = null;
        let videoPath = null;

        if (req.files) {
            if (req.files["image"]) {
                imagePath = `${serverUrl}/uploads/${req.files["image"][0].filename}`;
            }
            if (req.files["video"]) {
                videoPath = `${serverUrl}/uploads/${req.files["video"][0].filename}`;
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
        // Fetch the existing innovation document
        const innovation = await Innovation.findById(req.params.id);
        if (!innovation) {
            return res.status(404).json({ message: 'Innovation not found' });
        }

        // Start with the update data from the request body
        const updatedData = { ...req.body };
        const serverUrl = process.env.SERVER_URL || "http://localhost:5000";

        // Remove empty image/video fields that might be sent as {} from req.body
        if (updatedData.image && typeof updatedData.image === 'object' && Object.keys(updatedData.image).length === 0) {
            delete updatedData.image;
        }
        if (updatedData.video && typeof updatedData.video === 'object' && Object.keys(updatedData.video).length === 0) {
            delete updatedData.video;
        }

        // Ensure that if category is an object, extract its _id
        if (updatedData.category && typeof updatedData.category === 'object') {
            if (updatedData.category._id) {
                updatedData.category = updatedData.category._id;
            }
        }

        // Helper function to remove a file based on its stored URL
        const removeFile = (fileUrl) => {
            const relativePath = fileUrl.split(`${serverUrl}`)[1];
            if (relativePath) {
                const filePath = path.join(__dirname, "..", relativePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        };

        // Handle file updates (if provided)
        if (req.files) {
            if (req.files["image"]) {
                if (innovation.image) {
                    removeFile(innovation.image);
                }
                updatedData.image = `${serverUrl}/uploads/${req.files["image"][0].filename}`;
            }
            if (req.files["video"]) {
                if (innovation.video) {
                    removeFile(innovation.video);
                }
                updatedData.video = `${serverUrl}/uploads/${req.files["video"][0].filename}`;
            }
        }

        // Update the innovation document with the new data
        const updatedInnovation = await Innovation.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        res.json({
            message: 'Innovation updated successfully',
            updatedInnovation
        });
    } catch (error) {
        console.error("[ERROR] updateInnovation error:", error);
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
