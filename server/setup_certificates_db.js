require('dotenv').config()
const { sql } = require('./config/db')

async function createCertificatesTable() {
  try {
    console.log('Sertifikatlar (Certificates) cədvəli yoxlanır/yaradılır...')

    await sql`
      CREATE TABLE IF NOT EXISTS certificates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        issued_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      );
    `
    // Tələbə adını və kurs adını sonradan asan götürmək üçün joins edəcəyik
    console.log('✅ Sertifikatlar cədvəli hazırdır.')
  } catch (error) {
    console.error('Səhv baş verdi:', error)
  } finally {
    process.exit(0)
  }
}

createCertificatesTable()
