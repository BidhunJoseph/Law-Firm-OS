"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const MAX_FREE_TIER_BYTES = 1073741824; // 1 GB in bytes

export async function getStorageQuota() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  // Sum all document sizes across the entire database to simulate the tenant's global quota
  const aggregate = await db.document.aggregate({
    _sum: {
      file_size_bytes: true,
    },
  });

  const usedBytes = Number(aggregate._sum.file_size_bytes || 0);
  
  return {
    usedBytes,
    totalBytes: MAX_FREE_TIER_BYTES,
    percentage: Math.min((usedBytes / MAX_FREE_TIER_BYTES) * 100, 100),
  };
}

export async function getWorkspaceDocuments() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const documents = await db.document.findMany({
    include: {
      case: true,
      uploader: true,
    },
    orderBy: { created_at: 'desc' }
  });

  return documents;
}

export async function getWorkspaceCases() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const cases = await db.case.findMany({
    orderBy: { created_at: 'desc' }
  });

  return cases;
}

export async function generateUploadUrl(fileName: string, caseId: string, mimeType: string, sizeBytes: number) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  // Check quota
  const { usedBytes } = await getStorageQuota();
  if (usedBytes + sizeBytes > MAX_FREE_TIER_BYTES) {
    throw new Error("Storage quota exceeded. Please upgrade your plan.");
  }

  // Create a safe, unique file path
  const ext = fileName.split('.').pop();
  const safeName = fileName.replace(/[^a-zA-Z0-9-]/g, "_").substring(0, 50);
  const filePath = `${caseId}/${Date.now()}-${safeName}.${ext}`;

  // We rely on the client using supabase-js to upload directly to this path.
  // We'll return the path so the client knows where to upload.
  return { filePath };
}

export async function registerDocumentMetadata(data: {
  fileName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  caseId: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const profile = await db.profile.findUnique({ where: { id: user.id } });
  if (!profile) throw new Error("Profile not found");

  const document = await db.document.create({
    data: {
      firm_id: profile.firm_id,
      file_name: data.fileName,
      storage_path: data.filePath,
      storage_bucket: 'documents',
      mime_type: data.mimeType,
      file_size_bytes: data.sizeBytes,
      case_id: data.caseId,
      uploaded_by: user.id,
    },
    include: {
      case: true,
      uploader: true
    }
  });

  return document;
}

export async function getSignedDownloadUrl(filePath: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const { data, error: urlError } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

  if (urlError || !data?.signedUrl) {
    throw new Error("Failed to generate download link.");
  }

  return data.signedUrl;
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const document = await db.document.findUnique({ where: { id } });
  if (!document) throw new Error("Document not found");

  // Remove from Supabase Storage
  await supabase.storage.from(document.storage_bucket).remove([document.storage_path]);

  // Remove from DB
  await db.document.delete({ where: { id } });

  return { success: true };
}
