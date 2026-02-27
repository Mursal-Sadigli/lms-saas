require('dotenv').config()
const { neon } = require('@neondatabase/serverless')

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL mühit dəyişəni tapılmadı! .env faylını yoxlayın.')
}

const sql = neon(process.env.DATABASE_URL)

async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as time`
    console.log('✅ Neon DB bağlantısı uğurludur:', result[0].time)
    return true
  } catch (err) {
    console.error('❌ Neon DB bağlantı xətası:', err.message)
    return false
  }
}

module.exports = { sql, testConnection }
