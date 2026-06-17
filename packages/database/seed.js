const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.dyyshiiptldrpwjtelzx:Lawadmin%40123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('Starting seed process for Multi-Tenant OS...');

  // 1. Create a Master Firm
  const firm = await prisma.firm.create({
    data: {
      name: 'Alpha Legal Consultancy'
    }
  });
  console.log('Created Firm:', firm.id);

  // 2. Create the System Admin / Managing Partner (Must match the Supabase auth.users ID)
  const adminId = '008c7ffb-0dc2-4253-8c2a-a613682d28c8';
  
  const admin = await prisma.profile.upsert({
    where: { id: adminId },
    update: {
      firm_id: firm.id,
      full_name: 'System Admin',
      email: 'admin@lawfirm.os',
      role: 'managing_partner',
      is_active: true
    },
    create: {
      id: adminId,
      firm_id: firm.id,
      full_name: 'System Admin',
      email: 'admin@lawfirm.os',
      role: 'managing_partner',
      is_active: true
    }
  });
  console.log('Created Admin Profile:', admin.id);

  // 3. Create a Demo Client
  const client = await prisma.client.create({
    data: {
      firm_id: firm.id,
      name: 'Acme Corp',
      email: 'legal@acmecorp.com',
      phone: '+971501234567'
    }
  });
  console.log('Created Client:', client.id);

  // 4. Create a Demo Case
  const demoCase = await prisma.case.create({
    data: {
      firm_id: firm.id,
      client_id: client.id,
      case_code: 'LIT-2026-001',
      title: 'Acme Corp vs. Omega LLC Breach of Contract',
      current_phase: 'Review',
      current_status: 'open',
      risk_level: 'amber',
      blocked_by: 'client',
      blocking_reason: 'Awaiting signed POA',
      created_by: admin.id
    }
  });
  console.log('Created Case:', demoCase.id);

  // 5. Create Case Assignment
  await prisma.caseAssignment.create({
    data: {
      firm_id: firm.id,
      case_id: demoCase.id,
      user_id: admin.id,
      assignment_role: 'lead_lawyer'
    }
  });

  console.log('Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
