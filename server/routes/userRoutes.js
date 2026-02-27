const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { getProfile, syncUser, updateRole } = require('../controllers/userController')

router.get('/me', requireAuth, getProfile)
router.post('/sync', syncUser)           // Clerk webhook → ictimai endpoint
router.put('/role', requireAuth, updateRole)

module.exports = router
