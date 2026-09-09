const express = require('express');
const router = express.Router();
const { getDoctors, getPolies, createPoli, updatePoli, deletePoli } = require('../controllers/masterController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/doctors', authenticate, getDoctors);
router.get('/polies', authenticate, getPolies);
router.post('/polies', authenticate, authorize('admin'), createPoli);
router.put('/polies/:id', authenticate, authorize('admin'), updatePoli);
router.delete('/polies/:id', authenticate, authorize('admin'), deletePoli);

module.exports = router;