const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { getProfile, syncUser, updateRole, toggleWishlist, getWishlist, updateEducatorProfile } = require('../controllers/userController')

router.get('/me', requireAuth, getProfile)
router.post('/sync', syncUser)           // Clerk webhook → ictimai endpoint
router.put('/role', requireAuth, updateRole)

router.get('/wishlist', requireAuth, getWishlist)
router.post('/wishlist', requireAuth, toggleWishlist)

router.put('/educator-profile', requireAuth, updateEducatorProfile)

module.exports = router
