const express = require('express');
const router = express.Router();
const { getDoctors, getPolies } = require('../controllers/masterController');
const { authenticate } = require('../middlewares/auth');

router.get('/doctors', authenticate, getDoctors);
router.get('/polies', authenticate, getPolies);

module.exports = router;