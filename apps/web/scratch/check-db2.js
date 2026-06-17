const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query('SELECT * FROM "Document" ORDER BY created_at DESC LIMIT 5');
  console.log("Latest 5 Documents:");
  console.table(res.rows);
  await client.end();
}
check().catch(console.error);
