// routes/relationsRoutes.js
const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Innovation = require('../models/innovation');
const Investor = require('../models/investor');
const Commitment = require('../models/commitment');
const Investment = require('../models/investment');
const Innovator = require('../models/innovator');

// Get all categories with their innovations
router.get('/categories-with-innovations', async (req, res) => {
    try {
        const categories = await Category.find().populate('innovations');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all innovations with their innovators
router.get('/innovations-with-innovators', async (req, res) => {
    try {
        const innovations = await Innovation.find().populate('createdBy');
        res.json(innovations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all investors with their investments
router.get('/investors-with-investments', async (req, res) => {
    try {
        const investors = await Investor.find().populate('investments');
        res.json(investors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all commitments with related investors and innovators
router.get('/commitments-with-relations', async (req, res) => {
    try {
        const commitments = await Commitment.find().populate('investor').populate('innovator');
        res.json(commitments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all investments with related innovations and commitments
router.get('/investments-with-relations', async (req, res) => {
    try {
        const investments = await Investment.find().populate('innovation').populate('commitment');
        res.json(investments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
