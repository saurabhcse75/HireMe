const express = require('express');
const router = express.Router();
const { registerWorker, registerEmployer, login, getMe, logout } = require('../controllers/auth/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Register endpoints
router.post('/register/worker', registerWorker);
router.post('/register/employer', registerEmployer);

// Login endpoint
router.post('/login', login);

// Get current user profile
router.get('/me', authMiddleware, getMe);

// Logout endpoint
router.post('/logout', logout);

module.exports = router;
