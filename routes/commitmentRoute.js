const express = require('express');
const router = express.Router();
const Commitment = require('../models/commitment');

// GET all commitments
router.get('/', async (req, res) => {
  try {
    const commitments = await Commitment.find()
      .populate('investor', 'name')      // adjust fields as needed
      .populate('innovator', 'name');
    res.json(commitments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new commitment
router.post('/', async (req, res) => {
  const { conditions, investor, innovator } = req.body;
  try {
    const newCommitment = new Commitment({ conditions, investor, innovator });
    const savedCommitment = await newCommitment.save();
    res.status(201).json(savedCommitment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT to update investor sign (mark investor as signed)
router.put('/:id/investorSign', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCommitment = await Commitment.findByIdAndUpdate(
      id,
      { investorSign: true, status: 'Investor Signed' },
      { new: true }
    );
    res.json(updatedCommitment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT to update innovator sign (mark innovator as signed)
router.put('/:id/innovatorSign', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCommitment = await Commitment.findByIdAndUpdate(
      id,
      { innovatorSign: true, status: 'Approved' },
      { new: true }
    );
    res.json(updatedCommitment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
