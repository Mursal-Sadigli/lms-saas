const { verifyToken, createClerkClient } = require('@clerk/backend')
const { sql } = require('../config/db')

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

// Clerk token-i yoxlayan middleware
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tapılmadı. Giriş edin.' })
    }

    const token = authHeader.split(' ')[1]

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    req.auth = { userId: payload.sub }

    // JIT (Just-In-Time) İstifadəçi Sinxronizasiyası 
    // (Localhost-da Webhook işləməyəndə FK error verməməsi üçün)
    try {
      const [userExists] = await sql`SELECT id FROM users WHERE id = ${payload.sub}`
      if (!userExists) {
        const user = await clerkClient.users.getUser(payload.sub)
        const email = user.emailAddresses?.[0]?.emailAddress || ''
        const firstName = user.firstName || ''
        const lastName = user.lastName || ''
        const imageUrl = user.imageUrl || ''
        const role = user.publicMetadata?.role || 'student'
        
        await sql`
          INSERT INTO users (id, email, first_name, last_name, image_url, role)
          VALUES (${user.id}, ${email}, ${firstName}, ${lastName}, ${imageUrl}, ${role})
          ON CONFLICT (id) DO NOTHING
        `
        console.log(`⚡ JIT Sync: Yeni istifadəçi əlavə edildi -> ${email}`)
      }
    } catch (syncErr) {
      console.error('JIT Sync xətası (istifadəçi əlavə edilə bilmədi):', syncErr.message)
    }

    next()
  } catch (err) {
    console.error('Auth xətası:', err.message)
    return res.status(401).json({ error: 'Token etibarsızdır.' })
  }
}

// Yalnız educator-a icazə verən middleware
const requireEducator = async (req, res, next) => {
  try {
    const [user] = await sql`SELECT role FROM users WHERE id = ${req.auth.userId}`

    if (!user || user.role !== 'educator') {
      return res.status(403).json({ error: 'Bu əməliyyat yalnız müəllimlər üçündür.' })
    }
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { requireAuth, requireEducator }
