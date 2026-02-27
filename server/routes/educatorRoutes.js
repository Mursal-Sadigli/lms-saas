const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getAnalytics } = require('../controllers/educatorController');

const router = express.Router();

router.get('/analytics', requireAuth, getAnalytics);

module.exports = router;
