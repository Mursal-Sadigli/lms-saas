const express = require('express')
const router = express.Router()
const { getPublicSettings, getInstructorProfile } = require('../controllers/publicController')
const { trackVisitor } = require('../controllers/visitorController')

router.get('/settings', getPublicSettings)
router.get('/instructor/:id', getInstructorProfile)
router.post('/track', trackVisitor)

module.exports = router
