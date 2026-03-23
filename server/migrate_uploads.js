require('dotenv').config();
const { sql } = require('./config/db');

async function migrate() {
  console.log('🔄 Upload sütunları əlavə edilir...');
  try {
    // 1. Courses cədvəlinə pdf_url əlavə et (Kursun ümumi PDF-i üçün)
    await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS pdf_url TEXT;`;
    console.log('✅ courses.pdf_url əlavə edildi.');

    // 2. Course_videos cədvəlinə pdf_url və video_file_url əlavə et
    await sql`ALTER TABLE course_videos ADD COLUMN IF NOT EXISTS pdf_url TEXT;`;
    await sql`ALTER TABLE course_videos ADD COLUMN IF NOT EXISTS video_file_url TEXT;`;
    console.log('✅ course_videos.pdf_url və video_file_url əlavə edildi.');

    console.log('🚀 Miqrasiya uğurla tamamlandı.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Miqrasiya xətası:', err);
    process.exit(1);
  }
}

migrate();
