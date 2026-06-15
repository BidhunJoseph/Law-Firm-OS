import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Checking for 'documents' bucket...");
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  
  if (listError) {
    console.error("Failed to list buckets:", listError);
    process.exit(1);
  }

  const exists = buckets.find((b) => b.name === "documents");
  if (exists) {
    console.log("Bucket 'documents' already exists.");
  } else {
    console.log("Bucket 'documents' not found. Creating it now...");
    const { data, error } = await supabaseAdmin.storage.createBucket("documents", {
      public: false,
      allowedMimeTypes: ["image/png", "image/jpeg", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      fileSizeLimit: 52428800, // 50MB
    });

    if (error) {
      console.error("Failed to create bucket:", error);
      process.exit(1);
    }
    console.log("Successfully created 'documents' bucket!", data);
  }
}

main().catch(console.error);
