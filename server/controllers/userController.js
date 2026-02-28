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

  if (role === 'educator') {
    const [settings] = await sql`SELECT is_educator_registration_open FROM platform_settings WHERE id = 1`
    if (settings && settings.is_educator_registration_open === false) {
      return res.status(403).json({ error: 'Hazırda administrator tərəfindən müəllim qeydiyyatı dayandırılıb.' })
    }
  }

  const [user] = await sql`
    UPDATE users SET role = ${role}, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `

  res.json({ success: true, user })
}

// PUT /api/users/educator-profile
const updateEducatorProfile = async (req, res) => {
  const userId = req.auth.userId
  const { bio, youtube_link, linkedin_link } = req.body

  try {
    const [user] = await sql`
      UPDATE users 
      SET bio = ${bio || null}, 
          youtube_link = ${youtube_link || null}, 
          linkedin_link = ${linkedin_link || null},
          updated_at = NOW()
      WHERE id = ${userId}
      RETURNING *
    `
    res.json({ success: true, user })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

// POST /api/users/wishlist — wishlist-ə əlavə et və ya sil (toggle)
const toggleWishlist = async (req, res) => {
  const userId = req.auth.userId
  const { courseId } = req.body

  if (!courseId) return res.status(400).json({ error: 'courseId qeyd olunmayıb' })

  try {
    // Yoxla ki, kurs bazada var mı?
    const [existing] = await sql`SELECT id FROM wishlists WHERE user_id = ${userId} AND course_id = ${courseId}`

    if (existing) {
      // Varsa sil (remove from wishlist)
      await sql`DELETE FROM wishlists WHERE id = ${existing.id}`
      res.json({ success: true, message: 'Kurs seçilmişlərdən silindi', isWishlisted: false })
    } else {
      // Yoxdursa əlavə et (add to wishlist)
      await sql`INSERT INTO wishlists (user_id, course_id) VALUES (${userId}, ${courseId})`
      res.json({ success: true, message: 'Kurs seçilmişlərə əlavə edildi', isWishlisted: true })
    }
  } catch (err) {
    console.error('toggleWishlist xətası:', err)
    res.status(500).json({ error: 'Sistem xətası' })
  }
}

// GET /api/users/wishlist — tələbənin seçdiyi kursları qaytar
const getWishlist = async (req, res) => {
  const userId = req.auth.userId

  try {
    const wishlists = await sql`
      SELECT 
        w.id as wishlist_id,
        c.id, c.title, c.thumbnail, c.category, c.price, c.description,
        u.first_name || ' ' || COALESCE(u.last_name, '') AS educator_name,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE course_id = c.id) as rating
      FROM wishlists w
      JOIN courses c ON w.course_id = c.id
      JOIN users u ON c.educator_id = u.id
      WHERE w.user_id = ${userId}
      ORDER BY w.created_at DESC
    `

    res.json({ success: true, wishlists })
  } catch (err) {
    console.error('getWishlist xətası:', err)
    res.status(500).json({ error: 'Sistem xətası' })
  }
}

module.exports = { getProfile, syncUser, updateRole, toggleWishlist, getWishlist, updateEducatorProfile }
