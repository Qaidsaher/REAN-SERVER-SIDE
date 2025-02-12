// routes/commitmentRoutes.js
const express = require('express');
const router = express.Router();
const commitmentController = require('../controllers/commitmentController');

router.post('/create', commitmentController.createCommitment);
router.get('/all', commitmentController.getAllCommitments);
router.get('/:id', commitmentController.getCommitmentById);
router.put('/update/:id', commitmentController.updateCommitment);
router.delete('/delete/:id', commitmentController.deleteCommitment);

module.exports = router;