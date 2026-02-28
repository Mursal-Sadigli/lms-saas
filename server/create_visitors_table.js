require('dotenv').config();
const { sql } = require('./config/db');

async function createVisitorsTable() {
  console.log('Creating visitors_log table...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS visitors_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ip_address TEXT,
        device TEXT,
        browser TEXT,
        page_visited TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ visitors_log table successfully verified and created in Neon.');
  } catch (err) {
    console.error('❌ Error creating visitors_log:', err);
  } finally {
    process.exit(0);
  }
}

createVisitorsTable();
