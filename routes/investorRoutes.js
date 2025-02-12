// routes/investorRoutes.js
const express = require('express');
const router = express.Router();
const investorController = require('../controllers/investorController');

router.post('/create', investorController.createInvestor);
router.get('/all', investorController.getAllInvestors);
router.get('/:id', investorController.getInvestorById);
router.put('/update/:id', investorController.updateInvestor);
router.delete('/delete/:id', investorController.deleteInvestor);

module.exports = router;