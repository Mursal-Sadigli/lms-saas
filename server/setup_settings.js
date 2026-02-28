require('dotenv').config();
const { sql } = require('./config/db');

async function setupSettings() {
  try {
    console.log("Setting up platform_settings table...");
    
    await sql`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id SERIAL PRIMARY KEY,
        brand_name TEXT NOT NULL DEFAULT 'LMS Platform',
        contact_email TEXT NOT NULL DEFAULT 'admin@lms.com',
        platform_fee_percent NUMERIC NOT NULL DEFAULT 30,
        min_payout_amount NUMERIC NOT NULL DEFAULT 50,
        is_educator_registration_open BOOLEAN NOT NULL DEFAULT true,
        require_course_approval BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Sətir yoxdursa və ya boşdursa ilk sətri (ID: 1) əlavə et
    const [existing] = await sql`SELECT id FROM platform_settings WHERE id = 1`;
    if (!existing) {
      await sql`
        INSERT INTO platform_settings (id, brand_name, contact_email) 
        VALUES (1, 'Voltix Academy', 'sadiqli2024@gmail.com')
      `;
      console.log("İlkin məlumatlar tənzimləmə cədvəlinə daxil edildi.");
    } else {
      console.log("Cədvəl və məlumatlar artıq mövcuddur.");
    }
    
    process.exit(0);
  } catch(err) {
    console.error("Xəta baş verdi:", err);
    process.exit(1);
  }
}

setupSettings();
