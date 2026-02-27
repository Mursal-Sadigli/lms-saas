const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    await sql`ALTER TABLE course_videos ADD COLUMN IF NOT EXISTS quiz JSONB;`;
    
    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code             TEXT UNIQUE NOT NULL,
        discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
        course_id        UUID REFERENCES courses(id) ON DELETE CASCADE,
        educator_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        max_uses         INTEGER,
        used_count       INTEGER DEFAULT 0,
        expires_at       TIMESTAMPTZ,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        is_active        BOOLEAN DEFAULT true
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coupons_educator ON coupons(educator_id);`;

    console.log("Migration executed successfully");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
