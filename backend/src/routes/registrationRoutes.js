const express = require('express');
const router = express.Router();
const {
  getRegistrations,
  createRegistration,
  updateRegistrationStatus,
} = require('../controllers/registrationController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, getRegistrations);
router.post('/', authenticate, authorize('admin', 'petugas'), createRegistration);
router.put('/:id', authenticate, authorize('admin', 'petugas', 'dokter'), updateRegistrationStatus);

module.exports = router;