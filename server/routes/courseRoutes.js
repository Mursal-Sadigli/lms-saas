const express = require('express')
const router = express.Router()
const { requireAuth, requireEducator } = require('../middleware/auth')
const {
  getAllCourses, getCourseById, createCourse, publishCourse, getEducatorCourses, updateCourse
} = require('../controllers/courseController')

router.get('/', getAllCourses)
router.get('/educator', requireAuth, getEducatorCourses)
router.get('/:id', getCourseById)
router.put('/:id', requireAuth, requireEducator, updateCourse)
router.post('/', requireAuth, requireEducator, createCourse)
router.put('/:id/publish', requireAuth, requireEducator, publishCourse)

module.exports = router
