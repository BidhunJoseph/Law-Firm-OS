import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.dyyshiiptldrpwjtelzx:Lawadmin%40123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Wiping all non-admin users and cascading data...");

  // Get admin profile
  const admin = await prisma.profile.findFirst({
    where: { email: 'admin@law.com' }
  });

  if (!admin) {
    console.error("Admin user not found. Cannot proceed safely.");
    return;
  }

  // Delete all profiles EXCEPT admin (this will cascade delete or we might need to manually delete relations if restrict/set null)
  // Wait, Prisma might have restrict on assignments/cases. Let's delete cases/tasks/etc manually first.
  
  console.log("Deleting all external agency tasks...");
  await prisma.externalAgencyTask.deleteMany({});
  
  console.log("Deleting all documents...");
  await prisma.document.deleteMany({});
  
  console.log("Deleting all document requests...");
  await prisma.documentRequest.deleteMany({});

  console.log("Deleting all timeline events...");
  await prisma.timelineEvent.deleteMany({});
  
  console.log("Deleting all tasks...");
  await prisma.task.deleteMany({});
  
  console.log("Deleting all court events...");
  await prisma.courtEvent.deleteMany({});
  
  console.log("Deleting all case assignments...");
  await prisma.caseAssignment.deleteMany({});
  
  console.log("Deleting all cases...");
  await prisma.case.deleteMany({});

  console.log("Deleting all clients...");
  await prisma.client.deleteMany({});

  console.log("Deleting all profiles EXCEPT admin...");
  await prisma.profile.deleteMany({
    where: {
      email: {
        not: 'admin@law.com'
      }
    }
  });

  console.log("Wipe completed successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
