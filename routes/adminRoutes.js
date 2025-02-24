const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authAdminMiddleware = require('../middleware/adminMiddleware');

// Existing admin routes
router.get('/all', authAdminMiddleware, adminController.getAllAdmins);
router.get('/all-counts', authAdminMiddleware, adminController.getAllCounts);
router.get('/dashboard', authAdminMiddleware, adminController.getAdminDashboard);

// New routes for creating, updating, and deleting an admin

// Create a new admin
router.post('/create', authAdminMiddleware, adminController.createAdmin);

// Update an existing admin (use :id to identify which admin to update)
router.put('/update/:id', authAdminMiddleware, adminController.updateAdmin);

// Delete an admin (use :id to identify which admin to delete)
router.delete('/delete/:id', authAdminMiddleware, adminController.deleteAdmin);

module.exports = router;
