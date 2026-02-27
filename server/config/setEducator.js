require('dotenv').config()
const { sql } = require('./db')

async function run() {
  await sql`UPDATE users SET role = 'educator'`
  console.log('All users are now educators!')
  process.exit(0)
}
run()
