const { sql } = require('../config/db')

// GET /api/enrollments/my — tələbənin qeydiyyatlı kursları
const getMyEnrollments = async (req, res) => {
  const userId = req.auth.userId

  const enrollments = await sql`
    SELECT
      e.*,
      c.title, c.thumbnail, c.category, c.price,
      u.first_name || ' ' || COALESCE(u.last_name, '') AS educator_name
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    JOIN users u ON c.educator_id = u.id
    WHERE e.user_id = ${userId}
    ORDER BY e.enrolled_at DESC
  `

  res.json({ success: true, enrollments })
}

// POST /api/enrollments — kursa qeydiyyat (ödənişdən sonra)
const enrollCourse = async (req, res) => {
  const userId = req.auth.userId
  const { courseId, paymentId, amountPaid } = req.body

  // Kurs mövcuddurmu?
  const [course] = await sql`
    SELECT id, price FROM courses WHERE id = ${courseId} AND is_published = true
  `
  if (!course) {
    return res.status(404).json({ error: 'Kurs tapılmadı' })
  }

  // Artıq qeydiyyatlıdırsa?
  const [existing] = await sql`
    SELECT id FROM enrollments WHERE user_id = ${userId} AND course_id = ${courseId}
  `
  if (existing) {
    return res.status(409).json({ error: 'Artıq bu kursa qeydiyyatlısınız' })
  }

  const [enrollment] = await sql`
    INSERT INTO enrollments (user_id, course_id, payment_id, amount_paid)
    VALUES (${userId}, ${courseId}, ${paymentId}, ${amountPaid})
    RETURNING *
  `

  res.status(201).json({ success: true, enrollment })
}

// PUT /api/enrollments/:courseId/progress — proqresi yenilə
const updateProgress = async (req, res) => {
  const userId = req.auth.userId
  const { courseId } = req.params
  const { progress } = req.body

  let enrollment = null
  const [existing] = await sql`SELECT id FROM enrollments WHERE user_id = ${userId} AND course_id = ${courseId}`
  
  if (existing) {
    const [updated] = await sql`
      UPDATE enrollments SET progress = GREATEST(progress, ${progress})
      WHERE user_id = ${userId} AND course_id = ${courseId}
      RETURNING *
    `
    enrollment = updated
  } else {
    // Abunəliklə girənlər üçün enrollment yaradırıq
    const [inserted] = await sql`
      INSERT INTO enrollments (user_id, course_id, payment_id, amount_paid, progress)
      VALUES (${userId}, ${courseId}, 'subscription_access', 0, ${progress})
      RETURNING *
    `
    enrollment = inserted
  }

  // Əgər progress 100%-dirsə Sertifikat ver:
  if (progress === 100 || progress > 99) {
    await sql`
      INSERT INTO certificates (user_id, course_id)
      VALUES (${userId}, ${courseId})
      ON CONFLICT (user_id, course_id) DO NOTHING
    `
  }

  res.json({ success: true, enrollment })
}

// GET /api/enrollments/check/:courseId — qeydiyyat yoxlanışı
const checkEnrollment = async (req, res) => {
  try {
    const userId = req.auth.userId
    const { courseId } = req.params

    const [user] = await sql`SELECT subscription_status FROM users WHERE id = ${userId}`
    if (user && user.subscription_status && user.subscription_status !== 'free') {
      return res.json({ success: true, enrolled: true })
    }

    const [enrollment] = await sql`
      SELECT id FROM enrollments WHERE user_id = ${userId} AND course_id = ${courseId}
    `
    res.json({ success: true, enrolled: !!enrollment })
  } catch (err) {
    console.error('checkEnrollment xətası:', err)
    res.json({ success: true, enrolled: false }) // səssizcə false qaytar
  }
}

module.exports = { getMyEnrollments, enrollCourse, updateProgress, checkEnrollment }
