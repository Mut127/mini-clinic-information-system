const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptionById } = require('../controllers/prescriptionController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/', authenticate, authorize('dokter'), createPrescription);
router.get('/:id', authenticate, getPrescriptionById);

module.exports = router;