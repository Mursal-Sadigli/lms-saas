require('dotenv').config();
const { sql } = require('./config/db');

async function addGamificationCols() {
  console.log('Adding gamification columns to users table...');
  try {
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS streak_count INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMPTZ DEFAULT NOW();
    `;
    console.log('✅ Gamification columns successfully added to users table in Neon.');
  } catch (err) {
    console.error('❌ Error altering users table:', err.message);
  } finally {
    process.exit(0);
  }
}

addGamificationCols();
