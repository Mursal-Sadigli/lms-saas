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

module.exports = { getPublicSettings }
