import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.document.findMany({ include: { case: true } });
  console.log(`Found ${docs.length} documents.`);
  for (const doc of docs) {
    console.log(`- ${doc.file_name} (Case: ${doc.case?.title})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
