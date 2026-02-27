const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { getCourseReviews, addReview, deleteReview } = require('../controllers/reviewController')

router.get('/:courseId', getCourseReviews)
router.post('/', requireAuth, addReview)
router.delete('/:id', requireAuth, deleteReview)

module.exports = router
