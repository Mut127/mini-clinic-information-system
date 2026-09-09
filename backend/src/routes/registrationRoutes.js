const express = require('express');
const router = express.Router();
const {
  getRegistrations,
  createRegistration,
  updateRegistrationStatus,
  updateRegistration,
  deleteRegistration                    
} = require('../controllers/registrationController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, getRegistrations);
router.post('/', authenticate, authorize('admin', 'petugas'), createRegistration);
router.put('/:id', authenticate, authorize('admin', 'petugas', 'dokter'), updateRegistrationStatus);
router.put('/:id/edit', authenticate, authorize('admin', 'petugas'), updateRegistration);
router.delete('/:id', authenticate, authorize('admin', 'petugas'), deleteRegistration);

module.exports = router;