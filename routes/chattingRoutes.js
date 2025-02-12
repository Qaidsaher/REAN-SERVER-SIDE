// routes/chattingRoutes.js
const express = require('express');
const router = express.Router();
const chattingController = require('../controllers/chattingController');

router.post('/send', chattingController.createChat);
router.get('/all', chattingController.getAllChats);
router.get('/:id', chattingController.getChatById);
router.delete('/delete/:id', chattingController.deleteChat);

module.exports = router;
