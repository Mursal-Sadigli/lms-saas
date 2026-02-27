require('dotenv').config()
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function check() {
  const enrollments = await sql`SELECT user_id, course_id, enrolled_at FROM enrollments`
  const users = await sql`SELECT id, email, first_name FROM users`

  console.log('\n📋 USERS cədvəli:')
  console.log(users.length ? users : 'Boşdur')

  console.log('\n📋 ENROLLMENTS cədvəli:')
  console.log(enrollments.length ? enrollments : 'Boşdur')

  process.exit(0)
}

check().catch(e => { console.error(e.message); process.exit(1) })
