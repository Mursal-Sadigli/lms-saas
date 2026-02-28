require('dotenv').config();
const { createClerkClient } = require('@clerk/backend');
const { sql } = require('./config/db');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function fixUser() {
  try {
    const res = await clerkClient.users.getUserList();
    const users = res.data || res;
    const targetUser = users.find(u => u.emailAddresses[0]?.emailAddress === 'sadiqli2024@gmail.com');
    
    if (targetUser) {
       console.log("Clerk User tapıldı:", targetUser.id);
       
       const email = targetUser.emailAddresses[0].emailAddress;
       const firstName = targetUser.firstName || 'Super';
       const lastName = targetUser.lastName || 'Admin';
       const imageUrl = targetUser.imageUrl || '';
       
       // Postgres-ə əlavə et
       await sql`
         INSERT INTO users (id, email, first_name, last_name, image_url, role)
         VALUES (${targetUser.id}, ${email}, ${firstName}, ${lastName}, ${imageUrl}, 'admin')
         ON CONFLICT (id) DO UPDATE
         SET role = 'admin'
       `;
       console.log("✅ İstifadəçi Məlumat Bazasına da əlavə edildi / yeniləndi!");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixUser();
