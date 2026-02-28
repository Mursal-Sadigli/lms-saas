require('dotenv').config();
const { sql } = require('./config/db');

async function check() {
  const users = await sql`SELECT email, role FROM users`;
  console.log("USERS:", users);
  process.exit(0);
}

check();
