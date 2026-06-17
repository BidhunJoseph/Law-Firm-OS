import { db } from '../../packages/database/index';

async function test() {
  const cases = await db.case.findMany({ include: { documents: true } });
  console.log('Cases:', cases.map(c => ({ id: c.id, title: c.title, docCount: c.documents.length })));
}

test().catch(console.error);
