const express = require('express')
const router = express.Router()
const { getPublicSettings } = require('../controllers/publicController')
const { trackVisitor } = require('../controllers/visitorController')

router.get('/settings', getPublicSettings)
router.post('/track', trackVisitor)

module.exports = router
