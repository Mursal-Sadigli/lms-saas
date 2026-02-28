const express = require('express')
const router = express.Router()
const { getPublicSettings } = require('../controllers/publicController')

router.get('/settings', getPublicSettings)

module.exports = router
