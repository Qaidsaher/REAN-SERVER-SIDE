// routes/innovatorRoutes.js
const express = require('express');
const router = express.Router();
const innovatorController = require('../controllers/innovatorController');

router.post('/create', innovatorController.createInnovator);
router.get('/all', innovatorController.getAllInnovators);
router.get('/:id', innovatorController.getInnovatorById);
router.put('/update/:id', innovatorController.updateInnovator);
router.delete('/delete/:id', innovatorController.deleteInnovator);

module.exports = router;