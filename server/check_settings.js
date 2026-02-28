require('dotenv').config();
const { sql } = require('./config/db');

async function test() {
  try {
     const settings = await sql`SELECT * FROM platform_settings`;
     console.log("SETTINGS:", settings);
     process.exit(0);
  } catch(e) {
     console.error(e);
     process.exit(1);
  }
}
test();
