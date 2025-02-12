// routes/innovationRoutes.js
const express = require('express');
const router = express.Router();
const innovationController = require('../controllers/innovationController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/create', adminMiddleware, innovationController.createInnovation);
router.put('/update/:id', adminMiddleware, innovationController.updateInnovation);
router.delete('/delete/:id', adminMiddleware, innovationController.deleteInnovation);
router.get('/all', innovationController.getAllInnovations);
router.get('/:id', innovationController.getInnovationById);

module.exports = router;