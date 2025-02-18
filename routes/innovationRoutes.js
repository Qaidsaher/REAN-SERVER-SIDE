// routes/innovationRoutes.js
const express = require('express');
const router = express.Router();
const innovationController = require('../controllers/innovationController');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require("../middleware/multer");

router.post('/create', adminMiddleware,upload.fields([{ name: "image" }, { name: "video" }]), innovationController.createInnovation);
router.put('/update/:id', adminMiddleware,upload.fields([{ name: "image" }, { name: "video" }]), innovationController.updateInnovation);
router.delete('/delete/:id', adminMiddleware, innovationController.deleteInnovation);
router.get('/all', innovationController.getAllInnovations);
router.get('/:id', innovationController.getInnovationById);

module.exports = router;