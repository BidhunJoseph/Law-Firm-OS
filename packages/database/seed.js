const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.dyyshiiptldrpwjtelzx:Lawadmin%40123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' });

async function seed() {
  await client.connect();
  const res = await client.query('INSERT INTO "Profile" (id, email, name, role, created_at, updated_at, version) VALUES (\'008c7ffb-0dc2-4253-8c2a-a613682d28c8\', \'admin@lawfirm.os\', \'System Admin\', \'admin\', NOW(), NOW(), 1) ON CONFLICT (id) DO UPDATE SET email = \'admin@lawfirm.os\', role = \'admin\';');
  console.log('Profile seeded:', res.rowCount);
  await client.end();
}
seed().catch(console.error);
