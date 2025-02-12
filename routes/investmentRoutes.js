// routes/investmentRoutes.js
const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

router.post('/create', investmentController.createInvestment);
router.get('/all', investmentController.getAllInvestments);
router.get('/:id', investmentController.getInvestmentById);
router.put('/update/:id', investmentController.updateInvestment);
router.delete('/delete/:id', investmentController.deleteInvestment);

module.exports = router;