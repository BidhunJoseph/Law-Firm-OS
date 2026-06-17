import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const docs = await db.document.findMany();
  console.log('Total documents:', docs.length);
  if (docs.length > 0) {
    console.log(docs[0]);
  }
}
main().catch(console.error).finally(() => db.$disconnect());
