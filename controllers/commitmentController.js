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




// // controllers/commitments.controller.js

// const Commitment = require('../models/commitment');

// /**
//  * Get all commitments.
//  */
// exports.getAllCommitments = async (req, res) => {
//   try {
//     const commitments = await Commitment.find()
//       .populate('investor', 'firstName lastName email')
//       .populate('innovator', 'firstName lastName email');
//     res.status(200).json({ success: true, data: commitments });
//   } catch (error) {
//     console.error('Error fetching commitments:', error);
//     res.status(500).json({ success: false, error: 'Server error while fetching commitments' });
//   }
// };

// /**
//  * Get a commitment by ID.
//  */
// exports.getCommitmentById = async (req, res) => {
//   try {
//     const commitment = await Commitment.findById(req.params.id)
//       .populate('investor', 'firstName lastName email')
//       .populate('innovator', 'firstName lastName email');
//     if (!commitment) {
//       return res.status(404).json({ success: false, error: 'Commitment not found' });
//     }
//     res.status(200).json({ success: true, data: commitment });
//   } catch (error) {
//     console.error('Error fetching commitment:', error);
//     res.status(500).json({ success: false, error: 'Server error while fetching commitment' });
//   }
// };

// /**
//  * Create a new commitment.
//  * Expected req.body fields: conditions, milestones (array), investor, innovator, investorSign, innovatorSign, status.
//  */
// exports.createCommitment = async (req, res) => {
//   try {
//     const newCommitment = await Commitment.create(req.body);
//     res.status(201).json({ success: true, data: newCommitment });
//   } catch (error) {
//     console.error('Error creating commitment:', error);
//     res.status(500).json({ success: false, error: 'Server error while creating commitment' });
//   }
// };

// /**
//  * Update an existing commitment.
//  */
// exports.updateCommitment = async (req, res) => {
//   try {
//     const commitment = await Commitment.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!commitment) {
//       return res.status(404).json({ success: false, error: 'Commitment not found' });
//     }
//     res.status(200).json({ success: true, data: commitment });
//   } catch (error) {
//     console.error('Error updating commitment:', error);
//     res.status(500).json({ success: false, error: 'Server error while updating commitment' });
//   }
// };

// /**
//  * Delete a commitment.
//  */
// exports.deleteCommitment = async (req, res) => {
//   try {
//     const commitment = await Commitment.findByIdAndDelete(req.params.id);
//     if (!commitment) {
//       return res.status(404).json({ success: false, error: 'Commitment not found' });
//     }
//     res.status(200).json({ success: true, data: {} });
//   } catch (error) {
//     console.error('Error deleting commitment:', error);
//     res.status(500).json({ success: false, error: 'Server error while deleting commitment' });
//   }
// };

// /**
//  * Innovator signs the commitment.
//  * Endpoint: PATCH /api/commitments/:id/innovator-sign
//  */
// exports.innovatorSignCommitment = async (req, res) => {
//   try {
//     const commitment = await Commitment.findById(req.params.id);
//     if (!commitment) {
//       return res.status(404).json({ success: false, error: 'Commitment not found' });
//     }
//     // Set innovatorSign to true.
//     commitment.innovatorSign = true;
//     await commitment.save();
//     res.status(200).json({ success: true, data: commitment, message: 'Commitment signed by innovator.' });
//   } catch (error) {
//     console.error('Error during innovator sign:', error);
//     res.status(500).json({ success: false, error: 'Server error during innovator sign' });
//   }
// };

// /**
//  * Investor signs the commitment.
//  * Endpoint: PATCH /api/commitments/:id/investor-sign
//  */
// exports.investorSignCommitment = async (req, res) => {
//   try {
//     const commitment = await Commitment.findById(req.params.id);
//     if (!commitment) {
//       return res.status(404).json({ success: false, error: 'Commitment not found' });
//     }
//     // Set investorSign to true.
//     commitment.investorSign = true;
//     await commitment.save();
//     res.status(200).json({ success: true, data: commitment, message: 'Commitment signed by investor.' });
//   } catch (error) {
//     console.error('Error during investor sign:', error);
//     res.status(500).json({ success: false, error: 'Server error during investor sign' });
//   }
// };

// /**
//  * Admin updates the status of a commitment.
//  * Endpoint: PATCH /api/commitments/:id/admin-status
//  * Expected req.body: { status: "NewStatus" }
//  */
// exports.adminUpdateCommitmentStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!status) {
//       return res.status(400).json({ success: false, error: 'Status is required' });
//     }
//     const commitment = await Commitment.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true, runValidators: true }
//     );
//     if (!commitment) {
//       return res.status(404).json({ success: false, error: 'Commitment not found' });
//     }
//     res.status(200).json({ success: true, data: commitment, message: 'Commitment status updated by admin.' });
//   } catch (error) {
//     console.error('Error updating commitment status:', error);
//     res.status(500).json({ success: false, error: 'Server error while updating commitment status' });
//   }
// };
