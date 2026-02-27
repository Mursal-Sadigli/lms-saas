require('dotenv').config()
const { sql } = require('./db')

async function migrate() {
  console.log('🛠️  video_completions cədvəli yaradılır...\n')

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS video_completions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        video_id UUID NOT NULL REFERENCES course_videos(id) ON DELETE CASCADE,
        completed_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, video_id)
      )
    `
    console.log('✅ video_completions cədvəli')

    await sql`CREATE INDEX IF NOT EXISTS idx_vc_user ON video_completions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_vc_video ON video_completions(video_id)`
    
    console.log('✅ İndekslər')
    console.log('\n🎉 Tamamlandı!')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Migration xətası:', err.message)
    process.exit(1)
  }
}

migrate()
