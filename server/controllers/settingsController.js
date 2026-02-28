const { sql } = require('../config/db')

const getSettings = async (req, res) => {
  try {
    const [settings] = await sql`SELECT * FROM platform_settings WHERE id = 1`
    if (!settings) return res.status(404).json({ error: 'Tənzimləmələr tapılmadı' })
    res.json({ success: true, settings })
  } catch (error) {
    res.status(500).json({ error: 'Settings fetch xətası: ' + error.message })
  }
}

const updateSettings = async (req, res) => {
  const { 
    brand_name, contact_email, platform_fee_percent, min_payout_amount, 
    is_educator_registration_open, require_course_approval,
    support_phone, address, maintenance_mode, allow_student_reviews,
    max_upload_size_mb, stripe_public_key, stripe_secret_key,
    smtp_host, smtp_port, smtp_user, smtp_pass
  } = req.body

  try {
    const [settings] = await sql`
      UPDATE platform_settings
      SET 
        brand_name = COALESCE(${brand_name}, brand_name),
        contact_email = COALESCE(${contact_email}, contact_email),
        platform_fee_percent = COALESCE(${platform_fee_percent}, platform_fee_percent),
        min_payout_amount = COALESCE(${min_payout_amount}, min_payout_amount),
        is_educator_registration_open = COALESCE(${is_educator_registration_open}, is_educator_registration_open),
        require_course_approval = COALESCE(${require_course_approval}, require_course_approval),
        support_phone = COALESCE(${support_phone}, support_phone),
        address = COALESCE(${address}, address),
        maintenance_mode = COALESCE(${maintenance_mode}, maintenance_mode),
        allow_student_reviews = COALESCE(${allow_student_reviews}, allow_student_reviews),
        max_upload_size_mb = COALESCE(${max_upload_size_mb}, max_upload_size_mb),
        stripe_public_key = COALESCE(${stripe_public_key}, stripe_public_key),
        stripe_secret_key = COALESCE(${stripe_secret_key}, stripe_secret_key),
        smtp_host = COALESCE(${smtp_host}, smtp_host),
        smtp_port = COALESCE(${smtp_port}, smtp_port),
        smtp_user = COALESCE(${smtp_user}, smtp_user),
        smtp_pass = COALESCE(${smtp_pass}, smtp_pass),
        updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `
    res.json({ success: true, message: 'Tənzimləmələr uğurla yadda saxlanıldı!', settings })
  } catch (error) {
    res.status(500).json({ error: 'Settings update xətası: ' + error.message })
  }
}

module.exports = { getSettings, updateSettings }
