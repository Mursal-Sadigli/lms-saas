require('dotenv').config();
const { createClerkClient } = require('@clerk/backend');
const { sql } = require('./config/db');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function makeAdmin() {
  try {
    console.log("Yoxlanılır: sadiqli2024@gmail.com...");
    
    const [dbUser] = await sql`SELECT id FROM users WHERE email = 'sadiqli2024@gmail.com'`;
    
    if(!dbUser) {
       console.log("❌ Bu email ilə bazada heç bir istifadəçi tapılmadı.");
       process.exit(1);
    }
    
    console.log(`✅ İstifadəçi tapıldı: ${dbUser.id}. Clerk serverinə məlumat ötürülür...`);
    
    // Update Clerk Metadata (Bu, Frontenddə user.publicMetadata oxunuşunu dəyişir)
    await clerkClient.users.updateUser(dbUser.id, {
      publicMetadata: { role: 'admin' }
    });
    
    console.log(`✅ Clerk hesabı uğurla ADMIN edildi!`);
    
    // Update Postgres
    await sql`UPDATE users SET role = 'admin' WHERE id = ${dbUser.id}`;
    console.log("✅ Postgres DB də sinxronlaşdırıldı.");
    
    process.exit(0);
  } catch(err) {
    console.error("❌ Xəta baş verdi:", err);
    process.exit(1);
  }
}

makeAdmin();
