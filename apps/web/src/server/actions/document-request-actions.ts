'use server';

import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Core Authentication & RLS Security Helper
 */
async function requireAuthAndFirm() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) throw new Error("Unauthorized");

  const profile = await db.profile.findUnique({
    where: { id: session.user.id }
  });

  if (!profile) throw new Error("Profile not found");
  if (!profile.firm_id) throw new Error("Firm not found for user");
  
  return { userId: profile.id, firmId: profile.firm_id, role: profile.role };
}

const CreateDocumentRequestSchema = z.object({
  case_id: z.string().uuid(),
  requested_from_actor: z.enum(['client', 'lawyer', 'paralegal', 'external_agency']),
  requested_from_user_id: z.string().uuid().optional(),
  document_type: z.string().min(1, "Document type is required"),
  description: z.string().optional(),
  required_format: z.string().optional(),
  due_at: z.string().optional().transform(val => val ? new Date(val) : undefined),
  client_visible_instruction: z.string().optional(),
});

export async function createDocumentRequest(rawData: z.infer<typeof CreateDocumentRequestSchema>) {
  try {
    const { firmId, userId, role } = await requireAuthAndFirm();
    
    // Validate payload
    const data = CreateDocumentRequestSchema.parse(rawData);

    // Verify case belongs to firm
    const caseRecord = await db.case.findUnique({
      where: { id: data.case_id, firm_id: firmId }
    });
    
    if (!caseRecord) {
      throw new Error("Case not found or access denied");
    }

    const newRequest = await db.documentRequest.create({
      data: {
        firm_id: firmId,
        case_id: data.case_id,
        requested_from_actor: data.requested_from_actor,
        requested_from_user_id: data.requested_from_user_id,
        document_type: data.document_type,
        description: data.description,
        required_format: data.required_format,
        due_at: data.due_at,
        client_visible_instruction: data.client_visible_instruction,
        requested_by: userId,
        status: 'requested',
      }
    });

    // Add Timeline Event
    await db.timelineEvent.create({
      data: {
        firm_id: firmId,
        case_id: data.case_id,
        actor_user_id: userId,
        actor_type: role,
        event_type: 'DOCUMENT_REQUESTED',
        title: 'Document Requested',
        description: `Requested ${data.document_type} from ${data.requested_from_actor}.`,
      }
    });

    revalidatePath(`/workspace/cases/${data.case_id}`);
    return { success: true, request: newRequest };
  } catch (error: any) {
    console.error("Failed to create document request:", error);
    return { success: false, error: error.message };
  }
}

export async function approveDocument(requestId: string, documentId: string) {
  try {
    const { firmId, userId, role } = await requireAuthAndFirm();

    const normalizedRole = role.toLowerCase();
    if (!['admin', 'manager', 'owner', 'managing_partner', 'lawyer', 'paralegal'].includes(normalizedRole)) {
      throw new Error(`Unauthorized: Role '${role}' cannot approve documents.`);
    }

    z.string().uuid().parse(requestId);
    z.string().uuid().parse(documentId);

    // Ensure it belongs to the firm
    const request = await db.documentRequest.findUnique({
      where: { id: requestId, firm_id: firmId }
    });

    if (!request) {
      throw new Error("Document request not found");
    }

    const document = await db.document.findUnique({
      where: { id: documentId, firm_id: firmId }
    });

    if (!document) {
      throw new Error("Document not found");
    }

    if (document.request_id !== requestId) {
      throw new Error("Document does not belong to this request");
    }

    await db.$transaction(async (tx) => {
      await tx.documentRequest.update({
        where: { id: requestId },
        data: { status: 'approved' }
      });

      await tx.document.update({
        where: { id: documentId },
        data: { 
          review_status: 'approved',
          confidentiality_level: 'case_confidential' 
        }
      });

      await tx.timelineEvent.create({
        data: {
          firm_id: firmId,
          case_id: request.case_id,
          actor_user_id: userId,
          actor_type: role,
          event_type: 'DOCUMENT_APPROVED',
          title: 'Document Approved',
          description: `Document for request ${request.document_type} has been approved.`,
        }
      });
    });

    revalidatePath(`/workspace/cases/${request.case_id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to approve document:", error);
    return { success: false, error: error.message };
  }
}

const RejectDocumentSchema = z.object({
  requestId: z.string().uuid(),
  documentId: z.string().uuid(),
  rejectionReason: z.string().min(1, "Rejection reason is required")
});

export async function rejectDocument(rawData: z.infer<typeof RejectDocumentSchema>) {
  try {
    const { firmId, userId, role } = await requireAuthAndFirm();

    const normalizedRole = role.toLowerCase();
    if (!['admin', 'manager', 'owner', 'managing_partner', 'lawyer', 'paralegal'].includes(normalizedRole)) {
      throw new Error(`Unauthorized: Role '${role}' cannot reject documents.`);
    }
    
    const data = RejectDocumentSchema.parse(rawData);

    // Ensure it belongs to the firm
    const request = await db.documentRequest.findUnique({
      where: { id: data.requestId, firm_id: firmId }
    });

    if (!request) {
      throw new Error("Document request not found");
    }

    const document = await db.document.findUnique({
      where: { id: data.documentId, firm_id: firmId }
    });

    if (!document) {
      throw new Error("Document not found");
    }

    if (document.request_id !== data.requestId) {
      throw new Error("Document does not belong to this request");
    }

    await db.$transaction(async (tx) => {
      await tx.documentRequest.update({
        where: { id: data.requestId },
        data: { 
          status: 'rejected',
          rejection_reason: data.rejectionReason
        }
      });

      await tx.document.update({
        where: { id: data.documentId },
        data: { 
          review_status: 'rejected'
        }
      });

      await tx.timelineEvent.create({
        data: {
          firm_id: firmId,
          case_id: request.case_id,
          actor_user_id: userId,
          actor_type: role,
          event_type: 'DOCUMENT_REJECTED',
          title: 'Document Rejected',
          description: `Document for request ${request.document_type} was rejected. Reason: ${data.rejectionReason}`,
        }
      });
    });

    revalidatePath(`/workspace/cases/${request.case_id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to reject document:", error);
    return { success: false, error: error.message };
  }
}
