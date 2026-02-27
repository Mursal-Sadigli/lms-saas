require('dotenv').config();
const { sql } = require('./config/db');

async function fixDB() {
  console.log('Fixing Database...');
  try {
    // 1. Create video_completions table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS video_completions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        video_id UUID NOT NULL REFERENCES course_videos(id) ON DELETE CASCADE,
        completed_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, video_id)
      );
    `;
    console.log('✅ video_completions table verified/created.');
    
    // 2. Also ensure quiz column exists in course_videos just in case
    await sql`
      ALTER TABLE course_videos ADD COLUMN IF NOT EXISTS quiz JSONB;
    `;
    console.log('✅ quiz column verified in course_videos.');

    console.log('✅ Database fix complete.');
  } catch (err) {
    console.error('❌ Error fixing DB:', err);
  } finally {
    process.exit(0);
  }
}

fixDB();
