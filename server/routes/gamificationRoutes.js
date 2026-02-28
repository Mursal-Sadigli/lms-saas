const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { syncUserStreak, earnXP, getLeaderboard } = require('../controllers/gamificationController')

// Public (Heç bir identifikasiya istəmir)
router.get('/leaderboard', getLeaderboard)

// Protected (Ancaq daxil olmuş şəxslər seriyalarını və XP-lərini yeniləyə bilər)
router.post('/sync-streak', requireAuth, syncUserStreak)
router.post('/earn-xp', requireAuth, earnXP)

module.exports = router
