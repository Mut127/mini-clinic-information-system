const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getMedicalRecordsByPatient,
} = require('../controllers/medicalRecordController');
const { authenticate, authorize } = require('../middlewares/auth');

// Cuma dokter yang boleh input pemeriksaan
router.post('/', authenticate, authorize('dokter'), createMedicalRecord);

// Semua role yang login bisa lihat riwayat
router.get('/:patientId', authenticate, getMedicalRecordsByPatient);

module.exports = router;