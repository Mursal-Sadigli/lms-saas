require('dotenv').config()
const { sql } = require('../config/db')

// Stripe obyektini dinamik yolla əldə etmək üçün helper
const getStripeInstance = async () => {
  const [settings] = await sql`SELECT stripe_secret_key FROM platform_settings WHERE id = 1`
  const secretKey = (settings && settings.stripe_secret_key) ? settings.stripe_secret_key : process.env.STRIPE_SECRET_KEY
  return require('stripe')(secretKey)
}

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

  const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:5173'
  const stripe = await getStripeInstance()

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
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&courseId=${course.id}`,
      cancel_url: `${clientUrl}/course/${course.id}?payment=cancelled`,
    })

  res.json({ success: true, url: session.url, sessionId: session.id })
}

// POST /api/payments/subscribe — Aylıq / İllik B2B/B2C paketləri almaq (SaaS)
const createSubscriptionSession = async (req, res) => {
  const { planType } = req.body // 'monthly', 'yearly', 'enterprise'
  const userId = req.auth.userId

  if (!['monthly', 'yearly', 'enterprise'].includes(planType)) {
    return res.status(400).json({ error: 'Yanlış abunəlik planı seçilmişdir' })
  }

  try {
    const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:5173'
    const stripe = await getStripeInstance()

    let unitAmount = 2000 // default $20.00
    let interval = 'month'
    let productName = 'LearnHub B2C Aylıq Abunəlik'

    if (planType === 'yearly') {
      unitAmount = 20000 // $200.00
      interval = 'year'
      productName = 'LearnHub B2C İllik Abunəlik'
    } else if (planType === 'enterprise') {
      unitAmount = 50000 // $500.00
      interval = 'month'
      productName = 'LearnHub B2B Enterprise Şirkət Planı'
    }

    const price = await stripe.prices.create({
      unit_amount: unitAmount,
      currency: 'usd',
      recurring: { interval },
      product_data: { name: productName },
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { userId, planType },
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
      cancel_url: `${clientUrl}/pricing?payment=cancelled`,
    })

    res.json({ success: true, url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Subscription error:', error)
    res.status(500).json({ error: error.message })
  }
}

// GET /api/payments/verify?sessionId=xxx — ödənişi yoxla, enrollment yarat, /learn-ə yönləndir
const verifyPayment = async (req, res) => {
  const { sessionId } = req.query
  const userId = req.auth.userId

  if (!sessionId) return res.status(400).json({ error: 'Session ID lazımdır' })

  const stripe = await getStripeInstance()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    return res.status(400).json({ error: 'Ödəniş tamamlanmayıb' })
  }

  // Əgər Abunəlik ödənişidirsə (Localhost-da webhook çalışmadığı üçün dərhal verify edirik)
  if (session.mode === 'subscription') {
    const { planType } = session.metadata
    const subscriptionId = session.subscription
    const customerId = session.customer

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const [existing] = await sql`SELECT id FROM subscriptions WHERE stripe_subscription_id = ${subscriptionId}`
    if (!existing) {
      let companyId = null
      if (planType === 'enterprise') {
        const [company] = await sql`
          INSERT INTO companies (name, admin_id)
          VALUES ('Yeni Şirkət', ${userId})
          RETURNING id
        `
        companyId = company.id
      }

      await sql`
        INSERT INTO subscriptions (user_id, company_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_start, current_period_end)
        VALUES (${userId}, ${companyId}, ${customerId}, ${subscriptionId}, ${planType}, ${subscription.status}, to_timestamp(${subscription.current_period_start}), to_timestamp(${subscription.current_period_end}))
        ON CONFLICT (stripe_subscription_id) DO NOTHING
      `

      const subStatus = planType === 'enterprise' ? 'b2b_enterprise' : (planType === 'yearly' ? 'b2c_yearly' : 'b2c_monthly')
      await sql`
        UPDATE users 
        SET subscription_status = ${subStatus}, company_id = COALESCE(${companyId}, company_id)
        WHERE id = ${userId}
      `
    }
    
    return res.json({ success: true, redirectUrl: planType === 'enterprise' ? '/company/dashboard' : '/student/dashboard' })
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
    
    // ƏGƏR ABUNƏLİKDİRSƏ (SaaS)
    if (session.mode === 'subscription') {
      const { userId, planType } = session.metadata
      const subscriptionId = session.subscription
      const customerId = session.customer
      
      const stripeInstance = await getStripeInstance()
      const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId)

      let companyId = null
      if (planType === 'enterprise') {
        const [company] = await sql`
          INSERT INTO companies (name, admin_id)
          VALUES ('Yeni Şirkət', ${userId})
          RETURNING id
        `
        companyId = company.id
      }

      await sql`
        INSERT INTO subscriptions (user_id, company_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_start, current_period_end)
        VALUES (${userId}, ${companyId}, ${customerId}, ${subscriptionId}, ${planType}, ${subscription.status}, to_timestamp(${subscription.current_period_start}), to_timestamp(${subscription.current_period_end}))
      `

      const subStatus = planType === 'enterprise' ? 'b2b_enterprise' : (planType === 'yearly' ? 'b2c_yearly' : 'b2c_monthly')
      await sql`
        UPDATE users 
        SET subscription_status = ${subStatus}, company_id = COALESCE(${companyId}, company_id)
        WHERE id = ${userId}
      `
      console.log(`✅ Subscription Created: user=${userId}, plan=${planType}`)
    } 
    // ƏGƏR BİRDƏFƏLİK KURS ALINMASIDIRSA
    else {
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
  } 
  else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const status = subscription.status
    
    await sql`
      UPDATE subscriptions 
      SET status = ${status}, 
          current_period_start = to_timestamp(${subscription.current_period_start}), 
          current_period_end = to_timestamp(${subscription.current_period_end})
      WHERE stripe_subscription_id = ${subscription.id}
    `
    // Əgər cancelled olubsa user-in lisenziyasını ləğv et
    if (status === 'canceled' || status === 'unpaid') {
      await sql`
        UPDATE users 
        SET subscription_status = 'free' 
        WHERE id = (SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ${subscription.id})
           OR company_id = (SELECT company_id FROM subscriptions WHERE stripe_subscription_id = ${subscription.id})
      `
    }
  }

  res.json({ received: true })
}

// B2B şirkət idarəsi (İşçilərin emaillərinin əlavə edilməsi / Təsdiqi)
const addCompanyEmployee = async (req, res) => {
  const { email } = req.body
  const adminId = req.auth.userId
  
  try {
    const [company] = await sql`SELECT id FROM companies WHERE admin_id = ${adminId}`
    if (!company) return res.status(403).json({ error: 'Sizin şirkət profiliniz yoxdur.' })
      
    await sql`
      INSERT INTO company_invitations (company_id, email, status)
      VALUES (${company.id}, ${email}, 'pending')
      ON CONFLICT (company_id, email) DO NOTHING
    `
    // Check if user already exists
    const [user] = await sql`SELECT id FROM users WHERE email_addresses @> ${JSON.stringify([{email_address: email}])}::jsonb`
    if (user) {
      await sql`UPDATE users SET company_id = ${company.id}, subscription_status = 'b2b_enterprise' WHERE id = ${user.id}`
      await sql`UPDATE company_invitations SET status = 'accepted' WHERE email = ${email}`
    }

    res.json({ success: true, message: 'İşçi əlavə edildi' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getCompanyEmployees = async (req, res) => {
  const adminId = req.auth.userId
  try {
    const [company] = await sql`SELECT id FROM companies WHERE admin_id = ${adminId}`
    if (!company) return res.status(403).json({ error: 'Şirkət profiliniz yoxdur.' })
    
    const employees = await sql`
      SELECT c.email, c.status, u.first_name, u.last_name, u.created_at
      FROM company_invitations c
      LEFT JOIN users u ON u.email_addresses @> jsonb_build_array(jsonb_build_object('email_address', c.email))
      WHERE c.company_id = ${company.id}
    `
    res.json({ success: true, employees })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const removeCompanyEmployee = async (req, res) => {
  const { email } = req.body
  const adminId = req.auth.userId
  try {
    const [company] = await sql`SELECT id FROM companies WHERE admin_id = ${adminId}`
    await sql`DELETE FROM company_invitations WHERE company_id = ${company.id} AND email = ${email}`
    await sql`UPDATE users SET company_id = NULL, subscription_status = 'free' WHERE company_id = ${company.id} AND email_addresses @> jsonb_build_array(jsonb_build_object('email_address', ${email}))`
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { createCheckoutSession, verifyPayment, stripeWebhook, createSubscriptionSession, addCompanyEmployee, getCompanyEmployees, removeCompanyEmployee }
