const express = require('express')
const router = express.Router()
const { requireAuth, requireAdmin } = require('../middleware/auth')
const {
  getAdminStats,
  getAllUsers,
  getAllCourses,
  changeUserRole,
  adminDeleteCourse,
  approveCourse,
  getVisitorLogs
} = require('../controllers/adminController')

const {
  getSettings,
  updateSettings
} = require('../controllers/settingsController')

// Bütün admin yolları həm login olmalıdır, həm də rolu admin olmalıdır
router.use(requireAuth, requireAdmin)

router.get('/stats', getAdminStats)
router.get('/users', getAllUsers)
router.get('/courses', getAllCourses)
router.put('/users/:id/role', changeUserRole)
router.delete('/courses/:id', adminDeleteCourse)
router.put('/courses/:id/approve', approveCourse) // Added new route
router.get('/visitors', getVisitorLogs)
// Tənzimləmələr yolları
router.get('/settings', getSettings)
router.put('/settings', updateSettings)

module.exports = router
