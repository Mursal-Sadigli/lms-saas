const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { getMyEnrollments, enrollCourse, updateProgress, checkEnrollment } = require('../controllers/enrollmentController')

router.get('/my', requireAuth, getMyEnrollments)
router.get('/check/:courseId', requireAuth, checkEnrollment)
router.post('/', requireAuth, enrollCourse)
router.put('/:courseId/progress', requireAuth, updateProgress)

module.exports = router
