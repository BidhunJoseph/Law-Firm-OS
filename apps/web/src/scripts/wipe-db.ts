import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.dyyshiiptldrpwjtelzx:Lawadmin%40123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new Pool({ connectionString });

async function wipe() {
  await pool.query(`TRUNCATE TABLE "Firm", "Profile", "Client", "Case", "Task", "CaseAssignment", "CourtEvent", "Document", "DocumentRequest" CASCADE;`);
  console.log('Wiped DB via pure PG!');
}

wipe().catch(console.error).finally(() => pool.end());
