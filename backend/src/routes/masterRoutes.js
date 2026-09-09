const express = require('express');
const router = express.Router();
const {
  getDoctors, getPolies,
  createPoli, updatePoli, deletePoli,
  createDoctor, updateDoctor, deleteDoctor,
} = require('../controllers/masterController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/doctors', authenticate, getDoctors);
router.post('/doctors', authenticate, authorize('admin'), createDoctor);
router.put('/doctors/:id', authenticate, authorize('admin'), updateDoctor);
router.delete('/doctors/:id', authenticate, authorize('admin'), deleteDoctor);

router.get('/polies', authenticate, getPolies);
router.post('/polies', authenticate, authorize('admin'), createPoli);
router.put('/polies/:id', authenticate, authorize('admin'), updatePoli);
router.delete('/polies/:id', authenticate, authorize('admin'), deletePoli);

module.exports = router;