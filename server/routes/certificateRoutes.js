const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { getMyCertificates, getCertificateById } = require('../controllers/certificateController')

// Public (İctimai Yoxlanış)
router.get('/verify/:id', getCertificateById)

// Protected (Yalnız daxil olunanlar görə bilər)
router.get('/my', requireAuth, getMyCertificates)

module.exports = router
