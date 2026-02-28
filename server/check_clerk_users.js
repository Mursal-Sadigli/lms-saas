require('dotenv').config();
const { createClerkClient } = require('@clerk/backend');
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function checkClerkUsers() {
  try {
    const res = await clerkClient.users.getUserList();
    const users = res.data || res; // depending on SDK version
    const map = users.map(u => ({
      id: u.id,
      email: u.emailAddresses[0]?.emailAddress,
      role: u.publicMetadata?.role
    }));
    console.log("Clerk Users:", map);

    // Let's make sadiqli2024@gmail.com an admin right now
    const targetUser = map.find(u => u.email === 'sadiqli2024@gmail.com');
    if (targetUser) {
       console.log("Tapıldı! Admin edilir...");
       await clerkClient.users.updateUser(targetUser.id, {
         publicMetadata: { role: 'admin' }
       });
       console.log("✅ Clerk-də ADMIN statusu uğurla verildi!");
    } else {
       console.log("sadiqli2024@gmail.com tapılmadı.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Xəta:", err);
    process.exit(1);
  }
}

checkClerkUsers();
