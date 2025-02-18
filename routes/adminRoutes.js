// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authAdminMiddleware = require('../middleware/adminMiddleware');
// const { getAllCounts } = require("../controllers/adminController");
router.get('/all',authAdminMiddleware, adminController.getAllAdmins);
router.get("/all-counts",authAdminMiddleware, adminController.getAllCounts);
router.get('/dashboard',authAdminMiddleware, adminController.getAdminDashboard);

module.exports = router;
