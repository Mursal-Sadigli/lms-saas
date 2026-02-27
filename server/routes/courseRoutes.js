const express = require('express')
const router = express.Router()
const { requireAuth, requireEducator } = require('../middleware/auth')
const {
  getAllCourses, getCourseById, createCourse, publishCourse, getEducatorCourses
} = require('../controllers/courseController')

router.get('/', getAllCourses)
router.get('/educator', requireAuth, getEducatorCourses)
router.get('/:id', getCourseById)
router.post('/', requireAuth, requireEducator, createCourse)
router.put('/:id/publish', requireAuth, requireEducator, publishCourse)

module.exports = router
