require('dotenv').config();
const { sql } = require('./config/db');

async function updateRoleEnum() {
  try {
    console.log("Updating users table role constraints...");
    await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`;
    await sql`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'educator', 'admin'))`;
    await sql`UPDATE users SET role = 'admin' WHERE email = 'sadiqli2024@gmail.com'`;
    console.log("Role update successful! Mursal is now an admin!");
    process.exit(0);
  } catch(err) {
    console.error("Xəta baş verdi:", err);
    process.exit(1);
  }
}

updateRoleEnum();
