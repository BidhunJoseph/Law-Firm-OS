import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe("NOTIFY pgrst, 'reload schema';");
  console.log("POSTGREST CACHE RELOADED");
}
main().catch(console.error).finally(() => prisma.$disconnect());
