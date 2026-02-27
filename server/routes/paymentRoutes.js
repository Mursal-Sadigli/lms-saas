const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { createCheckoutSession, verifyPayment, stripeWebhook } = require('../controllers/paymentController')

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
router.post('/checkout', requireAuth, createCheckoutSession)
router.get('/verify', requireAuth, verifyPayment)

module.exports = router
