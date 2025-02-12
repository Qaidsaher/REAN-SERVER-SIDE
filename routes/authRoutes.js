const express = require('express');
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', authMiddleware, getMe);
router.put('/change-password', authMiddleware,changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
