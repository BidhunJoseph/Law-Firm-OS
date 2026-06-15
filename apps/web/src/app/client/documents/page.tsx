import { getWorkspaceDocuments, getWorkspaceCases, getStorageQuota } from "@/server/actions/storage-actions";
import { CloudDriveClient } from "./CloudDriveClient";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Cloud Drive | Law Firm OS",
};

export default async function CloudDrivePage() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect("/login");
    }

    const documents = await getWorkspaceDocuments();
    const cases = await getWorkspaceCases();
    const quota = await getStorageQuota();

    const formattedDocs = documents.map(d => ({
      id: d.id,
      name: d.file_name,
      path: d.file_path,
      type: d.mime_type,
      size: d.size_bytes,
      caseName: d.case?.title || "Unassigned",
      uploaderName: d.profile?.name || "Unknown",
      uploadDate: d.created_at.toISOString(),
    }));

    return <CloudDriveClient documents={formattedDocs} cases={cases} quota={quota} />;
  } catch (error) {
    console.error("Error loading drive:", error);
    redirect("/login");
  }
}
