import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const { data, error } = await supabase.storage.from('documents').upload('test.txt', 'Hello World', { upsert: true });
  console.log('Upload Result:', data, error);

  const { data: list, error: listError } = await supabase.storage.from('documents').list();
  console.log('Bucket Contents:', list, listError);
}
test();
