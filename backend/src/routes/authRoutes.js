const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// 1. Register new account
router.post('/register', AuthController.register);

// 2. Login & receive JWT
router.post('/login', AuthController.login);

// 3. Request password reset token
router.post('/forgot-password', AuthController.forgotPassword);

// 4. Reset password using token
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
