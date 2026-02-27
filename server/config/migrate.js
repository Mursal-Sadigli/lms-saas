require('dotenv').config()
const { sql } = require('./db')

async function migrate() {
  console.log('🛠️  Cədvəllər yaradılır...\n')

  try {
    // UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`
    console.log('✅ pgcrypto extension')

    // USERS
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY,
        email       TEXT UNIQUE NOT NULL,
        first_name  TEXT,
        last_name   TEXT,
        role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'educator')),
        image_url   TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('✅ users cədvəli')

    // COURSES
    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title        TEXT NOT NULL,
        description  TEXT,
        price        NUMERIC(10,2) NOT NULL DEFAULT 0,
        thumbnail    TEXT,
        category     TEXT,
        educator_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_published BOOLEAN DEFAULT false,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('✅ courses cədvəli')

    // COURSE VIDEOS
    await sql`
      CREATE TABLE IF NOT EXISTS course_videos (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title       TEXT NOT NULL,
        video_url   TEXT NOT NULL,
        duration    TEXT,
        position    INTEGER NOT NULL,
        is_free     BOOLEAN DEFAULT false,
        description TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log('✅ course_videos cədvəli')

    // ENROLLMENTS
    await sql`
      CREATE TABLE IF NOT EXISTS enrollments (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        payment_id  TEXT,
        amount_paid NUMERIC(10,2),
        progress    INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
        enrolled_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      )
    `
    console.log('✅ enrollments cədvəli')

    // REVIEWS
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment    TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      )
    `
    console.log('✅ reviews cədvəli')

    // İNDEKSLƏR
    await sql`CREATE INDEX IF NOT EXISTS idx_courses_educator ON courses(educator_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_videos_course ON course_videos(course_id)`
    console.log('✅ İndekslər')

    console.log('\n🎉 Bütün cədvəllər uğurla yaradıldı!')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Migration xətası:', err.message)
    process.exit(1)
  }
}

migrate()
