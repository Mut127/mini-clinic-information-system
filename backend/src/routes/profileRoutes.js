const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { getProfile, updateProfile, uploadAvatar, deleteAvatar } = require('../controllers/profileController');

router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', authenticate, deleteAvatar);

module.exports = router;