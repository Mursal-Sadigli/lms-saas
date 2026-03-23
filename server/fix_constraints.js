require('dotenv').config();
const { sql } = require('./config/db');

async function fixConstraints() {
  console.log('🔄 Constraints düzəldilir...');
  try {
    // video_url sütununu nullable et
    await sql`ALTER TABLE course_videos ALTER COLUMN video_url DROP NOT NULL;`;
    console.log('✅ course_videos.video_url artıq nullable-dır.');

    console.log('🚀 Düzəliş tamamlandı.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Xəta:', err);
    process.exit(1);
  }
}

fixConstraints();
