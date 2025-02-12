// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authAdminMiddleware = require('../middleware/adminMiddleware');
const admin = require('../models/admin');
// const { getAllCounts } = require("../controllers/adminController");
router.get('/all',authAdminMiddleware, adminController.getAllAdmins);
router.post('/login', adminController.login);
router.post('/logout', authAdminMiddleware, adminController.logout);
router.get('/profile', authAdminMiddleware, adminController.getProfile);
router.post('/forgot-password', adminController.forgotPassword);
// routes/adminRoutes.js
router.post('/create', authAdminMiddleware, adminController.createAdmin);
router.put('/update/:id', authAdminMiddleware, adminController.updateAdmin);
router.delete('/delete/:id', authAdminMiddleware, adminController.deleteAdmin);
router.get("/all-counts",authAdminMiddleware, adminController.getAllCounts);
module.exports = router;