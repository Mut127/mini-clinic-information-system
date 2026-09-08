const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { authenticate, authorize } = require('../middlewares/auth');

// Semua role yang login bisa lihat data pasien
router.get('/', authenticate, getPatients);
router.get('/:id', authenticate, getPatientById);

// Cuma admin & petugas yang bisa kelola data pasien
router.post('/', authenticate, authorize('admin', 'petugas'), createPatient);
router.put('/:id', authenticate, authorize('admin', 'petugas'), updatePatient);
router.delete('/:id', authenticate, authorize('admin'), deletePatient);

module.exports = router;