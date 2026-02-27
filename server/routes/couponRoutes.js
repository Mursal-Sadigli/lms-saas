const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createCoupon, getEducatorCoupons, validateCoupon, deleteCoupon } = require('../controllers/couponController');

const router = express.Router();

// Publicly accessible but authenticated route to validate coupon before checkout
router.post('/validate', requireAuth, validateCoupon);

// Educator routes
router.post('/', requireAuth, createCoupon);
router.get('/educator', requireAuth, getEducatorCoupons);
router.delete('/:id', requireAuth, deleteCoupon);

module.exports = router;
