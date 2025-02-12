// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/create', adminMiddleware, categoryController.createCategory);
router.put('/update/:id', adminMiddleware, categoryController.updateCategory);
router.delete('/delete/:id', adminMiddleware, categoryController.deleteCategory);
router.get('/all', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

module.exports = router;