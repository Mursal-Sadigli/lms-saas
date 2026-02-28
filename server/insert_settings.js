require('dotenv').config();
const { sql } = require('./config/db');

async function insert() {
  try {
    await sql`
      INSERT INTO platform_settings (
        id, brand_name, contact_email, platform_fee_percent, min_payout_amount,
        is_educator_registration_open, require_course_approval, maintenance_mode,
        allow_student_reviews
      ) VALUES (
        1, 'LearnHub', 'admin@learnhub.com', 15, 50, true, false, false, true
      ) ON CONFLICT (id) DO NOTHING
    `;
    console.log("✅ Platform Settings üçün ilkin sətir uğurla əlavə edildi.");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
insert();
