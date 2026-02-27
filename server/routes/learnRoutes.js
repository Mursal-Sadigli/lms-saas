const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { getLearnData, completeVideo } = require('../controllers/learnController')

router.get('/:courseId', requireAuth, getLearnData)
router.post('/:videoId/complete', requireAuth, completeVideo)

module.exports = router
