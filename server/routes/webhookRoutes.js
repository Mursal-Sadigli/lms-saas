const express = require('express')
const router = express.Router()
const { clerkWebhook } = require('../controllers/webhookController')

// Clerk webhook — raw body tələb edir
router.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhook)

module.exports = router
