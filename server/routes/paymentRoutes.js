const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { createCheckoutSession, verifyPayment, stripeWebhook, createSubscriptionSession, addCompanyEmployee, getCompanyEmployees, removeCompanyEmployee } = require('../controllers/paymentController')

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
router.post('/checkout', requireAuth, createCheckoutSession)
router.get('/verify', requireAuth, verifyPayment)

// SaaS routes
router.post('/subscribe', requireAuth, createSubscriptionSession)
router.get('/company/employees', requireAuth, getCompanyEmployees)
router.post('/company/employees', requireAuth, addCompanyEmployee)
router.delete('/company/employees', requireAuth, removeCompanyEmployee)

module.exports = router
