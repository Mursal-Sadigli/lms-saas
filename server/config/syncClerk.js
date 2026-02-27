require('dotenv').config()
const { createClerkClient } = require('@clerk/backend')
const { sql } = require('./db')

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

async function syncUsers() {
  console.log('🔄 Clerk istifadəçiləri DB-yə sinxronizasiya edilir...')

  try {
    // Clerk-dən bütün istifadəçiləri çək
    const response = await clerkClient.users.getUserList()
    // Yeni Clerk API-də getUserList { data: Users[], totalCount: number } qaytarır
    const users = response?.data || response

    if (!users || users.length === 0) {
      console.log('Clerk-də Heç bir istifadəçi tapılmadı.')
      process.exit(0)
    }

    console.log(`Clerk-də ${users.length} istifadəçi tapıldı. DB-yə əlavə edilir...`)

    for (const user of users) {
      const email = user.emailAddresses[0]?.emailAddress || ''
      const firstName = user.firstName || ''
      const lastName = user.lastName || ''
      const imageUrl = user.imageUrl || ''

      await sql`
        INSERT INTO users (id, email, first_name, last_name, image_url)
        VALUES (${user.id}, ${email}, ${firstName}, ${lastName}, ${imageUrl})
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          image_url = EXCLUDED.image_url
      `
      console.log(`✅ İstifadəçi sinxron edildi: ${email} (${user.id})`)
    }

    console.log('\n🎉 Bütün istifadəçilər uğurla sinxron edildi!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Xəta baş verdi:', error)
    process.exit(1)
  }
}

syncUsers()
