require('dotenv').config();
const { sql } = require('./config/db');

async function b() {
  await sql`UPDATE platform_settings SET maintenance_mode = true WHERE id = 1`;
  const [s] = await sql`SELECT maintenance_mode FROM platform_settings WHERE id = 1`;
  console.log("DB_IS_NOW:", s.maintenance_mode);
  process.exit(0);
}
b();
