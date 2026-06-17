import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.dyyshiiptldrpwjtelzx:Lawadmin%40123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redTeam = [
  { email: 'admin@lawfirm.os', name: 'Admin QA', role: 'admin' },
  { email: 'manager@lawfirm.os', name: 'Manager QA', role: 'manager' },
  { email: 'lawyer1@lawfirm.os', name: 'Lawyer One QA', role: 'lawyer' },
  { email: 'lawyer2@lawfirm.os', name: 'Lawyer Two QA', role: 'lawyer' },
  { email: 'paralegal1@lawfirm.os', name: 'Paralegal One QA', role: 'paralegal' },
  { email: 'paralegal2@lawfirm.os', name: 'Paralegal Two QA', role: 'paralegal' },
  { email: 'client1@client.com', name: 'Client One QA', role: 'client' },
  { email: 'client2@client.com', name: 'Client Two QA', role: 'client' },
  { email: 'client3@client.com', name: 'Client Three QA', role: 'client' },
  { email: 'client4@client.com', name: 'Client Four QA', role: 'client' },
  { email: 'client5@client.com', name: 'Client Five QA', role: 'client' },
];

async function seedRedTeam() {
  console.log('--- Initializing QA Red Team Seeder ---');

  // 1. Ensure a Firm exists for the Red Team
  let firm = await prisma.firm.findFirst({ where: { name: 'Red Team LLC' } });
  if (!firm) {
    firm = await prisma.firm.create({ data: { name: 'Red Team LLC' } });
    console.log('Created Firm:', firm.id);
  }

  // 2. Loop through Red Team
  for (const user of redTeam) {
    console.log(`Provisioning ${user.email} (${user.role})...`);

    // Delete existing from Prisma if any
    await prisma.profile.deleteMany({ where: { email: user.email } });

    // Try to delete from Supabase Auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers.users.find(u => u.email === user.email);
    if (existing) {
      await supabaseAdmin.auth.admin.deleteUser(existing.id);
    }

    // Create in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: {
        full_name: user.name,
        role: user.role,
        firm_id: firm.id
      }
    });

    if (authError) {
      console.error('Failed to create in Supabase:', authError);
      continue;
    }

    // Create in Prisma
    if (authData.user) {
      await prisma.profile.create({
        data: {
          id: authData.user.id,
          firm_id: firm.id,
          email: user.email,
          full_name: user.name,
          role: user.role,
          is_active: true
        }
      });
      console.log(`Successfully provisioned ${user.email}`);
    }
  }

  console.log('--- Red Team Seeding Complete ---');
  console.log('All users share the password: Password123!');
}

seedRedTeam()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
