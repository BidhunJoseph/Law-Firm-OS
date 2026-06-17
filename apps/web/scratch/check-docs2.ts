import { db } from '../../packages/database/index';

async function main() {
  const docs = await db.document.findMany();
  console.log('Total documents:', docs.length);
  if (docs.length > 0) {
    console.log(docs[0]);
  }
}
main().catch(console.error);
