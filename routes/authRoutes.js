const express = require('express');
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword,
    googleAuth,
    deleteAccount,
    updateAdminProfile
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/logout', logoutUser);
router.get('/me', authMiddleware, getMe);
router.put('/change-password', authMiddleware, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
router.delete('/delete-account', authMiddleware, deleteAccount);
router.put('/update-profile', authMiddleware, updateAdminProfile);

module.exports = router;
