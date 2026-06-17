'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const BUCKET_NAME = 'documents';

export async function uploadDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;
    const documentType = formData.get('documentType') as string || 'general';
    const requestId = formData.get('requestId') as string | null;

    if (!file || !caseId) {
      throw new Error('File and Case ID are required.');
    }

    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      throw new Error('Unauthorized');
    }

    // Get role and firm ID to ensure RLS compliance
    const profile = await db.profile.findUnique({
      where: { id: session.user.id },
      select: { firm_id: true }
    });
    if (!profile?.firm_id) {
      throw new Error('Firm ID missing for user.');
    }

    const firmId = profile.firm_id;
    const userId = session.user.id;
    
    // Create unique path: firm_id/case_id/timestamp-filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const storagePath = `${firmId}/${caseId}/${timestamp}-${safeFileName}`;

    // Convert File to ArrayBuffer for reliable Node.js server-side upload
    const buffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
    }

    // Save to Prisma
    const newDoc = await db.document.create({
      data: {
        firm_id: firmId,
        case_id: caseId,
        request_id: requestId || null,
        uploaded_by: userId,
        storage_bucket: BUCKET_NAME,
        storage_path: storagePath,
        file_name: file.name,
        mime_type: file.type,
        file_size_bytes: file.size,
        document_type: documentType,
        review_status: 'pending',
        confidentiality_level: 'case_confidential',
      }
    });

    // If it was fulfilling a request, update the request status
    if (requestId) {
      await db.documentRequest.update({
        where: { id: requestId },
        data: {
          status: 'uploaded',
          uploaded_document_id: newDoc.id
        }
      });
    }
    
    revalidatePath(`/os/dashboard`);
    return { success: true, document: newDoc };
  } catch (error: any) {
    console.error('Document upload failed:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteDocument(documentId: string, caseId: string) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Unauthorized');

    const doc = await db.document.findUnique({
      where: { id: documentId }
    });

    if (!doc) throw new Error('Document not found');

    // Remove from Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([doc.storage_path]);

    if (storageError) {
      console.error('Failed to delete from storage:', storageError);
    }

    // Remove from DB
    await db.document.delete({
      where: { id: documentId }
    });

    revalidatePath(`/os/dashboard`);
    return { success: true };
  } catch (error: any) {
    console.error('Document deletion failed:', error);
    return { success: false, error: error.message };
  }
}

export async function getSignedDownloadUrl(storagePath: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, 60 * 60); // 1 hour

    if (error) throw error;
    return { success: true, url: data.signedUrl };
  } catch (error: any) {
    console.error('Failed to get download URL:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleDocumentVisibility(documentId: string, isClientVisible: boolean) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Unauthorized');

    const profile = await db.profile.findUnique({
      where: { id: session.user.id },
      select: { firm_id: true }
    });
    if (!profile?.firm_id) throw new Error('Firm ID missing.');

    const doc = await db.document.findUnique({ where: { id: documentId } });
    if (!doc || doc.firm_id !== profile.firm_id) throw new Error("Document not found");

    const newLevel = isClientVisible ? 'client_visible' : 'case_confidential';

    await db.document.update({
      where: { id: documentId },
      data: { confidentiality_level: newLevel }
    });

    if (doc.case_id) {
      revalidatePath(`/os/dashboard`);
    }
    
    return { success: true, level: newLevel };
  } catch (error: any) {
    console.error('Toggle visibility failed:', error);
    return { success: false, error: error.message };
  }
}
