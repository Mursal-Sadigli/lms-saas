const { sql } = require('../config/db')

// GET /api/reviews/:courseId — kursun rəyləri
const getCourseReviews = async (req, res) => {
  const { courseId } = req.params

  const reviews = await sql`
    SELECT r.*, u.first_name, u.last_name, u.image_url
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.course_id = ${courseId}
    ORDER BY r.created_at DESC
  `

  res.json({ success: true, reviews })
}

// POST /api/reviews — rəy əlavə et
const addReview = async (req, res) => {
  const userId = req.auth.userId
  const { courseId, rating, comment } = req.body

  // Kursa qeydiyyatlıdırmı?
  const [enrolled] = await sql`
    SELECT id FROM enrollments
    WHERE user_id = ${userId} AND course_id = ${courseId}
  `
  if (!enrolled) {
    return res.status(403).json({ error: 'Yalnız alınmış kurslara rəy yaza bilərsiniz' })
  }

  // Artıq rəy yazıb?
  const [existing] = await sql`
    SELECT id FROM reviews WHERE user_id = ${userId} AND course_id = ${courseId}
  `
  if (existing) {
    return res.status(409).json({ error: 'Bu kursa artıq rəy yazmısınız' })
  }

  const [review] = await sql`
    INSERT INTO reviews (course_id, user_id, rating, comment)
    VALUES (${courseId}, ${userId}, ${rating}, ${comment})
    RETURNING *
  `

  res.status(201).json({ success: true, review })
}

// DELETE /api/reviews/:id — rəy sil
const deleteReview = async (req, res) => {
  const userId = req.auth.userId
  const { id } = req.params

  const [review] = await sql`
    DELETE FROM reviews WHERE id = ${id} AND user_id = ${userId} RETURNING *
  `

  if (!review) {
    return res.status(404).json({ error: 'Rəy tapılmadı və ya icazəniz yoxdur' })
  }

  res.json({ success: true, message: 'Rəy silindi' })
}

module.exports = { getCourseReviews, addReview, deleteReview }
