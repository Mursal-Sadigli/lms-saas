const { Webhook } = require('svix')
const { sql } = require('../config/db')

// POST /api/webhooks/clerk
// Clerk Dashboard-da Webhook URL-i: https://server-url/api/webhooks/clerk
// Events: user.created, user.updated
const clerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET tapılmadı!')
    return res.status(500).json({ error: 'Server konfiqurasi xətası' })
  }

  // Svix ilə Clerk imzasını yoxla
  const svix_id = req.headers['svix-id']
  const svix_timestamp = req.headers['svix-timestamp']
  const svix_signature = req.headers['svix-signature']

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Svix başlıqları tapılmadı' })
  }

  const wh = new Webhook(WEBHOOK_SECRET)
  let payload

  try {
    payload = wh.verify(JSON.stringify(req.body), {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('❌ Clerk webhook imza xətası:', err.message)
    return res.status(400).json({ error: 'İmza yoxlaması uğursuz oldu' })
  }

  const { type, data } = payload
  console.log(`📨 Clerk webhook: ${type}`)

  if (type === 'user.created' || type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = data
    const email = email_addresses?.[0]?.email_address
    const role = public_metadata?.role || 'student'

    await sql`
      INSERT INTO users (id, email, first_name, last_name, image_url, role)
      VALUES (${id}, ${email}, ${first_name || ''}, ${last_name || ''}, ${image_url || ''}, ${role})
      ON CONFLICT (id) DO UPDATE
      SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        image_url = EXCLUDED.image_url,
        role = EXCLUDED.role,
        updated_at = NOW()
    `
    console.log(`✅ İstifadəçi DB-yə yazıldı: ${email} (${role})`)
  }

  if (type === 'user.deleted') {
    const { id } = data
    await sql`DELETE FROM users WHERE id = ${id}`
    console.log(`🗑️  İstifadəçi silindi: ${id}`)
  }

  res.json({ success: true })
}

module.exports = { clerkWebhook }
