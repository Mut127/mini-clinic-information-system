const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

// Semua role yang login bisa lihat dashboard
router.get('/', authenticate, getDashboardStats);

module.exports = router;