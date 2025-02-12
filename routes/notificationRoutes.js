// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/create', notificationController.createNotification);
router.get('/all', notificationController.getAllNotifications);
router.get('/:id', notificationController.getNotificationById);
router.delete('/delete/:id', notificationController.deleteNotification);

module.exports = router;