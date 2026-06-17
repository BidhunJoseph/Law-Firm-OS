"use server";

import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

export async function assignUserToCase(caseId: string, targetUserId: string, assignmentRole: string) {
  try {
    const { firmId, role } = await requireAuthAndFirm();
    const normalizedRole = String(role).toLowerCase();
    
    if (!['admin', 'owner', 'managing_partner', 'manager', 'partner', 'lawyer'].includes(normalizedRole)) {
      throw new Error(`Unauthorized: Your role cannot assign users to matters.`);
    }

    const caseRecord = await db.case.findUnique({ where: { id: caseId, firm_id: firmId } });
    if (!caseRecord) throw new Error("Case not found");

    const targetProfile = await db.profile.findUnique({ where: { id: targetUserId, firm_id: firmId } });
    if (!targetProfile) throw new Error("Target user not found in firm");

    // Prevent duplicates
    const existing = await db.caseAssignment.findFirst({
      where: { case_id: caseId, user_id: targetUserId }
    });

    if (existing) {
      if (!existing.active) {
        await db.caseAssignment.update({ where: { id: existing.id }, data: { active: true, assignment_role: assignmentRole } });
      } else {
        await db.caseAssignment.update({ where: { id: existing.id }, data: { assignment_role: assignmentRole } });
      }
    } else {
      await db.caseAssignment.create({
        data: {
          firm_id: firmId,
          case_id: caseId,
          user_id: targetUserId,
          assignment_role: assignmentRole,
          active: true
        }
      });
    }

    revalidatePath(`/workspace/cases/${caseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeUserFromCase(caseId: string, targetUserId: string) {
  try {
    const { firmId, role } = await requireAuthAndFirm();
    const normalizedRole = String(role).toLowerCase();
    
    if (!['admin', 'owner', 'managing_partner', 'manager', 'partner', 'lawyer'].includes(normalizedRole)) {
      throw new Error(`Unauthorized: Your role cannot remove users from matters.`);
    }

    const caseRecord = await db.case.findUnique({ where: { id: caseId, firm_id: firmId } });
    if (!caseRecord) throw new Error("Case not found");

    // Remove assignment physically to keep tables clean, or mark active=false.
    // Let's physically delete it to perfectly clean the UI.
    await db.caseAssignment.deleteMany({
      where: { case_id: caseId, user_id: targetUserId }
    });

    revalidatePath(`/workspace/cases/${caseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
