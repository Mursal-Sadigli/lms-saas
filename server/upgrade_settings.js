require('dotenv').config();
const { sql } = require('./config/db');

async function upgradeSettings() {
  try {
    console.log("Upgrading platform_settings table with serious SaaS fields...");
    
    await sql`
      ALTER TABLE platform_settings
      ADD COLUMN IF NOT EXISTS support_phone TEXT DEFAULT '+994 50 000 00 00',
      ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'Bakı, Azərbaycan',
      ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS allow_student_reviews BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS max_upload_size_mb INTEGER DEFAULT 2048,
      ADD COLUMN IF NOT EXISTS stripe_public_key TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS smtp_host TEXT DEFAULT 'smtp.resend.com',
      ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 465,
      ADD COLUMN IF NOT EXISTS smtp_user TEXT DEFAULT 'resend',
      ADD COLUMN IF NOT EXISTS smtp_pass TEXT DEFAULT '';
    `;

    console.log("SUCCESS! Advanced Settings Columns added to platform_settings.");
    process.exit(0);
  } catch(err) {
    console.error("Error upgrading settings:", err);
    process.exit(1);
  }
}

upgradeSettings();
