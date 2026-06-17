const { prisma } = require('@lawfirm/database');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Initiating GRAND RESET...');

  // 1. Wipe Prisma Database
  console.log('Wiping Prisma Database...');
  await prisma.document.deleteMany();
  await prisma.documentRequest.deleteMany();
  await prisma.courtEvent.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.task.deleteMany();
  await prisma.case.deleteMany();
  await prisma.client.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.firm.deleteMany();

  // 2. Wipe Supabase Auth Users
  console.log('Wiping Supabase Auth...');
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
  } else {
    for (const user of users.users) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    }
  }

  // 3. Create the Firm
  console.log('Provisioning Firm...');
  const firm = await prisma.firm.create({
    data: {
      name: 'Grand Reset Legal OS',
    }
  });

  const accounts = [
    { email: 'admin@law.com', role: 'admin', name: 'Grand Admin' },
    { email: 'manager@law.com', role: 'manager', name: 'Grand Manager' },
    { email: 'lawyer@law.com', role: 'lawyer', name: 'Grand Lawyer' },
    { email: 'paralegal@law.com', role: 'paralegal', name: 'Grand Paralegal' },
    { email: 'client@law.com', role: 'client', name: 'Grand Client' },
  ];

  // 4. Create the Accounts
  for (const acc of accounts) {
    console.log(`Provisioning ${acc.email}...`);
    
    // Create in Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: acc.email,
      password: '123456',
      email_confirm: true,
      user_metadata: { name: acc.name }
    });

    if (authError || !authData.user) {
      console.error(`Failed to create ${acc.email} in Supabase:`, authError);
      continue;
    }

    // Create in Prisma
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        firm_id: firm.id,
        email: acc.email,
        full_name: acc.name,
        role: acc.role,
      }
    });

    if (acc.role === 'client') {
      await prisma.client.create({
        data: {
          firm_id: firm.id,
          name: acc.name,
          email: acc.email,
        }
      });
    }
  }

  console.log('Grand Reset Seeding Complete! 5 Perfect Accounts created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
