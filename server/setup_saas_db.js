require('dotenv').config()
const { sql } = require('./config/db')

async function up() {
  try {
    console.log('SaaS cədvəlləri yaradılır...')

    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        admin_id VARCHAR(255) REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) REFERENCES users(id),
        company_id UUID REFERENCES companies(id),
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        plan_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        current_period_start TIMESTAMPTZ,
        current_period_end TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS company_invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(company_id, email)
      );
    `

    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
    `

    console.log('✅ SaaS B2B/B2C cədvəlləri və sütunları uğurla bazaya əlavə edildi.')
  } catch (error) {
    console.error('Xəta baş verdi:', error)
  } finally {
    process.exit(0)
  }
}

up()
