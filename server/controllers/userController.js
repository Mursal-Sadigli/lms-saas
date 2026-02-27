const { sql } = require('../config/db')

// GET /api/users/me — öz profili gör
const getProfile = async (req, res) => {
  const userId = req.auth.userId

  const [user] = await sql`
    SELECT * FROM users WHERE id = ${userId}
  `

  if (!user) {
    return res.status(404).json({ error: 'İstifadəçi tapılmadı' })
  }

  res.json({ success: true, user })
}

// POST /api/users/sync — Clerk webhook-dan gələn istifadəçini DB-yə yaz
const syncUser = async (req, res) => {
  const { id, email_addresses, first_name, last_name, image_url, public_metadata } = req.body.data

  const email = email_addresses?.[0]?.email_address
  const role = public_metadata?.role || 'student'

  const [user] = await sql`
    INSERT INTO users (id, email, first_name, last_name, image_url, role)
    VALUES (${id}, ${email}, ${first_name}, ${last_name}, ${image_url}, ${role})
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
    RETURNING *
  `

  res.json({ success: true, user })
}

// PUT /api/users/role — istifadəçi rolunu dəyiş (educator ol)
const updateRole = async (req, res) => {
  const userId = req.auth.userId
  const { role } = req.body

  if (!['student', 'educator'].includes(role)) {
    return res.status(400).json({ error: 'Yanlış rol dəyəri' })
  }

  const [user] = await sql`
    UPDATE users SET role = ${role}, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `

  res.json({ success: true, user })
}

module.exports = { getProfile, syncUser, updateRole }
