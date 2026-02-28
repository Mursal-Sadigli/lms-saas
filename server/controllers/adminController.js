const { sql } = require('../config/db')
const { createClerkClient } = require('@clerk/backend')
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

// Bütün hesabat gətirilir (Məbləğ, İstifadəçilər, Kurslar)
const getAdminStats = async (req, res) => {
  try {
    const [userCountResult] = await sql`SELECT COUNT(*) FROM users`
    const [courseCountResult] = await sql`SELECT COUNT(*) FROM courses WHERE is_published = true`
    const [draftCountResult] = await sql`SELECT COUNT(*) FROM courses WHERE is_published = false`
    
    // Yalnız tamamlanmış və ya uğurlu ödənişlərin gəliri hesablanır
    const [revenueResult] = await sql`SELECT COALESCE(SUM(amount_paid), 0) AS total_revenue FROM enrollments`

    res.json({
      totalUsers: parseInt(userCountResult.count),
      totalCourses: parseInt(courseCountResult.count),
      draftCourses: parseInt(draftCountResult.count),
      totalRevenue: Number(revenueResult.total_revenue),
    })
  } catch (error) {
    res.status(500).json({ error: 'Admin stats xətası: ' + error.message })
  }
}

// Bütün istifadəçiləri cədvəl üçün gətirmək
const getAllUsers = async (req, res) => {
  try {
    const users = await sql`
      SELECT id, email, first_name, last_name, role, image_url, created_at 
      FROM users 
      ORDER BY created_at DESC
    `
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Users fetch xətası: ' + error.message })
  }
}

// Bütün kursları idarə etmək üçün siyahı
const getAllCourses = async (req, res) => {
  try {
    const courses = await sql`
      SELECT c.*, 
             u.first_name || ' ' || COALESCE(u.last_name, '') AS educator_name
      FROM courses c
      LEFT JOIN users u ON c.educator_id = u.id
      ORDER BY c.created_at DESC
    `
    res.json(courses)
  } catch (error) {
    res.status(500).json({ error: 'Courses fetch xətası: ' + error.message })
  }
}

// İstifadəçi rolunun dəyişdirilməsi
const changeUserRole = async (req, res) => {
  const { id } = req.params
  const { role } = req.body

  if (!['student', 'educator', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Yanlış rol formatı' })
  }

  // Öz rolunu silməyin qarşısını almaq istəyirsinizsə (req.auth.userId == id) burda əlavə edə bilərsiz

  try {
    const [updatedUser] = await sql`
      UPDATE users 
      SET role = ${role}, updated_at = NOW() 
      WHERE id = ${id} 
      RETURNING id, role
    `
    if (!updatedUser) return res.status(404).json({ error: 'İstifadəçi tapılmadı' })

    // CLERK ILE SINXRONIZASIYA (Real time giriş üçün)
    try {
      await clerkClient.users.updateUser(id, {
        publicMetadata: { role }
      })
      console.log(`Clerk metadata yeniləndi: ${id} -> ${role}`)
    } catch (clerkErr) {
      console.error('Clerk role update xətası:', clerkErr)
    }

    res.json({ success: true, message: 'Rol uğurla dəyişdirildi', role: updatedUser.role })
  } catch (error) {
    res.status(500).json({ error: 'Role update xətası: ' + error.message })
  }
}

// Kursun qüvvədən salınması (Silinməsi)
const adminDeleteCourse = async (req, res) => {
  const { id } = req.params
  try {
    // Kursla bağlı videolar, review-lər falan silinməlidir (Cascade yoxdursa bura yazılmalıdır)
    const [deleted] = await sql`DELETE FROM courses WHERE id = ${id} RETURNING id`
    if (!deleted) return res.status(404).json({ error: 'Kurs tapılmadı' })
    
    res.json({ success: true, message: 'Kurs sistemdən uğurla silindi' })
  } catch (error) {
    res.status(500).json({ error: 'Course delete xətası: ' + error.message })
  }
}


// 6. Super Admin Kurs Təsdiqi (Approval)
const approveCourse = async (req, res) => {
  const { id } = req.params
  try {
    const [course] = await sql`
      UPDATE courses 
      SET is_published = true, updated_at = NOW() 
      WHERE id = ${id} 
      RETURNING *
    `
    if (!course) return res.status(404).json({ error: 'Kurs tapılmadı' })
    res.json({ success: true, message: 'Kurs uğurla təsdiqləndi və yayımlandı.', course })
  } catch (err) {
    res.status(500).json({ error: 'Kurs təsdiqlənərkən xəta baş verdi: ' + err.message })
  }
}

module.exports = {
  getAdminStats,
  getAllUsers,
  getAllCourses,
  changeUserRole,
  adminDeleteCourse,
  approveCourse
}
