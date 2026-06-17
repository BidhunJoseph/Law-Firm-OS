const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase.storage.from('documents').createSignedUrl('752945aa-0dd8-4346-86fe-32048a094f1b/04bcd8a1-ff32-4af1-bbc3-2f509dee3ca7/1781710670675-Adobe_Scan_Feb_28__2026__5_.pdf', 3600);
  console.log(data, error);
}
test().catch(console.error);
