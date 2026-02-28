require('dotenv').config();
const { sql } = require('./config/db');

async function checkAndFixCourses() {
  try {
    const courses = await sql`SELECT id, title, is_published FROM courses`;
    console.log('Cari kurslar:', courses);

    // Bütün kursları avtomatik public edək ki, user görə bilsin
    const updated = await sql`UPDATE courses SET is_published = true RETURNING id, title, is_published`;
    console.log('✅ Bütün kurslar yayımlandı (is_published = true):', updated);
    
    // Mərhələ 10 üçün users cədvəlinə sütunları da əlavə edək hazır skript işləyirkən
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS youtube_link TEXT,
      ADD COLUMN IF NOT EXISTS linkedin_link TEXT;
    `;
    console.log('✅ Users cədvəlinə bio və sosial link sütunları əlavə edildi.');
  } catch (err) {
    console.error('Xəta:', err.message);
  } finally {
    process.exit(0);
  }
}

checkAndFixCourses();
