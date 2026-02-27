require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { sql } = require('../config/db')

// POST /api/payments/checkout — Stripe Checkout Session yarat
const createCheckoutSession = async (req, res) => {
  const { courseId, couponCode } = req.body
  const userId = req.auth.userId

  const [course] = await sql`
    SELECT * FROM courses WHERE id = ${courseId} AND is_published = true
  `
  if (!course) return res.status(404).json({ error: 'Kurs tapılmadı' })

  const [enrolled] = await sql`
    SELECT id FROM enrollments WHERE user_id = ${userId} AND course_id = ${courseId}
  `
  if (enrolled) return res.status(409).json({ error: 'Bu kursa artıq qeydiyyatlısınız' })

  let finalPrice = Number(course.price)

  if (couponCode) {
    const [coupon] = await sql`SELECT * FROM coupons WHERE code = ${couponCode} AND is_active = true`
    if (coupon) {
      if (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) {
        if (coupon.max_uses === null || coupon.used_count < coupon.max_uses) {
          if (coupon.course_id === null || coupon.course_id === courseId) {
            // Apply discount
            const discountAmount = finalPrice * (coupon.discount_percent / 100)
            finalPrice = Math.max(0, finalPrice - discountAmount)
          }
        }
      }
    }
  }

  // Əgər endirimdən sonra və ya əvvəldən kurs pulsuzdursa
  if (finalPrice <= 0) {
    await sql`
      INSERT INTO enrollments (user_id, course_id, payment_id, amount_paid)
      VALUES (${userId}, ${courseId}, 'free_or_100_percent_coupon', 0)
      ON CONFLICT (user_id, course_id) DO NOTHING
    `
    if (couponCode) {
      await sql`UPDATE coupons SET used_count = used_count + 1 WHERE code = ${couponCode}`
    }
    return res.json({ success: true, isFree: true, redirectUrl: `/learn/${courseId}` })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: course.title,
          description: course.description || '',
          images: course.thumbnail ? [course.thumbnail] : [],
        },
        unit_amount: Math.round(finalPrice * 100),
      },
      quantity: 1,
    }],
    metadata: { courseId: course.id, userId, couponCode: couponCode || '' },
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&courseId=${course.id}`,
    cancel_url: `${process.env.CLIENT_URL}/course/${course.id}?payment=cancelled`,
  })

  res.json({ success: true, url: session.url, sessionId: session.id })
}

// GET /api/payments/verify?sessionId=xxx — ödənişi yoxla, enrollment yarat, /learn-ə yönləndir
const verifyPayment = async (req, res) => {
  const { sessionId } = req.query
  const userId = req.auth.userId

  if (!sessionId) return res.status(400).json({ error: 'Session ID lazımdır' })

  // Stripe-dan session al
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    return res.status(400).json({ error: 'Ödəniş tamamlanmayıb' })
  }

  const { courseId, couponCode } = session.metadata

  // Enrollment yarat (yoxdursa)
  const result = await sql`
    INSERT INTO enrollments (user_id, course_id, payment_id, amount_paid)
    VALUES (${userId}, ${courseId}, ${session.payment_intent}, ${session.amount_total / 100})
    ON CONFLICT (user_id, course_id) DO NOTHING
    RETURNING id
  `

  if (result.length > 0 && couponCode) {
    await sql`UPDATE coupons SET used_count = used_count + 1 WHERE code = ${couponCode}`
  }

  console.log(`✅ Verify: enrollment yaradıldı/mövcuddur — user=${userId}, course=${courseId}`)

  res.json({ success: true, courseId, redirectUrl: `/learn/${courseId}` })
}

// POST /api/payments/webhook — Stripe webhook (STRIPE_WEBHOOK_SECRET varsa)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: `Webhook xətası: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { courseId, userId, couponCode } = session.metadata
    const result = await sql`
      INSERT INTO enrollments (user_id, course_id, payment_id, amount_paid)
      VALUES (${userId}, ${courseId}, ${session.payment_intent}, ${session.amount_total / 100})
      ON CONFLICT (user_id, course_id) DO NOTHING
      RETURNING id
    `
    if (result.length > 0 && couponCode) {
      await sql`UPDATE coupons SET used_count = used_count + 1 WHERE code = ${couponCode}`
    }
  }

  res.json({ received: true })
}

module.exports = { createCheckoutSession, verifyPayment, stripeWebhook }
