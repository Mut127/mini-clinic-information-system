const express = require('express');
const router = express.Router();
const {
  getQueues,
  createQueue,
  callQueue,
  updateQueueStatus,
} = require('../controllers/queueController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, getQueues);
router.post('/', authenticate, authorize('admin', 'petugas'), createQueue);
router.put('/:id/call', authenticate, authorize('admin', 'petugas', 'dokter'), callQueue);
router.put('/:id/status', authenticate, authorize('admin', 'petugas', 'dokter'), updateQueueStatus);

module.exports = router;