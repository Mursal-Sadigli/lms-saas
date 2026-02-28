require('dotenv').config();
const { sql } = require('./config/db');

async function createWishlistTable() {
  try {
    console.log("Creating wishlists table...");
    await sql`
      CREATE TABLE IF NOT EXISTS wishlists (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      )
    `;
    console.log("wishlists cədvəli uğurla yaradıldı!");
    process.exit(0);
  } catch(err) {
    console.error("Xəta baş verdi:", err);
    process.exit(1);
  }
}

createWishlistTable();
