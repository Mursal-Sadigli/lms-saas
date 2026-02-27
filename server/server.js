require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5000

// ── CORS ────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// ── Webhook route-ları — raw body tələb edir, express.json()-dan ƏVVƏL ──
app.use('/api/webhooks', require('./routes/webhookRoutes'))
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Stripe webhook raw body
  next()
})

// ── JSON Middleware ──────────────────────────
app.use(express.json())

// ── Routes ──────────────────────────────────
app.use('/api/courses', require('./routes/courseRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/enrollments', require('./routes/enrollmentRoutes'))
app.use('/api/reviews', require('./routes/reviewRoutes'))
app.use('/api/payments', require('./routes/paymentRoutes'))
app.use('/api/learn', require('./routes/learnRoutes'))
app.use('/api/coupons', require('./routes/couponRoutes'))
app.use('/api/educator', require('./routes/educatorRoutes'))

// ── Health check ────────────────────────────
app.get('/api/health', async (req, res) => {
  const { testConnection } = require('./config/db')
  const dbOk = await testConnection()
  res.json({
    status: 'ok',
    message: 'LearnHub API işləyir ✅',
    database: dbOk ? 'Neon DB bağlıdır ✅' : 'DB bağlantı xətası ❌',
    endpoints: [
      'GET  /api/courses',
      'GET  /api/courses/:id',
      'POST /api/courses',
      'GET  /api/users/me',
      'GET  /api/enrollments/my',
      'POST /api/payments/checkout',
      'POST /api/webhooks/clerk',
    ]
  })
})

// ── 404 ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route tapılmadı' })
})

// ── Error handler ───────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server xətası:', err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Daxili server xətası',
  })
})

// ── Start ────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 LearnHub Server → http://localhost:${PORT}`)
  console.log(`📋 Health: http://localhost:${PORT}/api/health\n`)
})
