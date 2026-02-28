const { sql } = require('../config/db')

const getPublicSettings = async (req, res) => {
  try {
    const [settings] = await sql`SELECT maintenance_mode, is_educator_registration_open, require_course_approval, allow_student_reviews, brand_name, contact_email, support_phone FROM platform_settings WHERE id = 1`
    
    if (!settings) {
      return res.json({ maintenance_mode: false, is_educator_registration_open: true })
    }

    res.json(settings)
  } catch (err) {
    console.error("Public settings error:", err)
    res.status(500).json({ error: "Xəta baş verdi" })
  }
}

const getInstructorProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const instructorRes = await sql`
      SELECT id, first_name, last_name, image_url, role, bio, youtube_link, linkedin_link, created_at
      FROM users
      WHERE id = ${id} AND (role = 'educator' OR role = 'admin')
    `;
    
    if (instructorRes.length === 0) return res.status(404).json({ error: 'Müəllim tapılmadı' });
    const instructor = instructorRes[0];

    const coursesRes = await sql`
      SELECT c.*,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as student_count,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews r WHERE r.course_id = c.id) as rating
      FROM courses c
      WHERE c.educator_id = ${id} AND c.is_published = true
      ORDER BY c.created_at DESC
    `;
    
    const totalStudents = coursesRes.reduce((acc, c) => acc + Number(c.student_count), 0);
    const totalRating = coursesRes.length > 0 
       ? coursesRes.reduce((acc, c) => acc + Number(c.rating), 0) / coursesRes.length
       : 0;

    res.json({
      instructor: {
         ...instructor,
         total_courses: coursesRes.length,
         total_students: totalStudents,
         average_rating: totalRating.toFixed(1)
      },
      courses: coursesRes
    });
  } catch (err) {
    console.error('getInstructorProfile error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getPublicSettings, getInstructorProfile }
