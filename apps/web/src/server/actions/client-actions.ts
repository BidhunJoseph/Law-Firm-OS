"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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

export async function getClients() {
  const { firmId } = await requireAuthAndFirm();
  const clients = await db.client.findMany({
    where: { firm_id: firmId },
    include: {
      _count: { select: { cases: true } }
    },
    orderBy: { created_at: "desc" }
  });
  return clients;
}

export async function getClientDetails(id: string) {
  const { firmId } = await requireAuthAndFirm();
  const client = await db.client.findUnique({
    where: { id, firm_id: firmId },
    include: {
      cases: {
        include: { assignments: { include: { user: true } } },
        orderBy: { created_at: "desc" }
      }
    }
  });

  if (!client) throw new Error("Client not found");

  const documents = await db.document.findMany({
    where: { firm_id: firmId, case_id: { in: client.cases.map((c: any) => c.id) } },
    include: { case: true },
    orderBy: { created_at: "desc" }
  });

  return { client, documents };
}

export async function updateClient(clientId: string, data: { name: string, email: string, phone?: string, passport_number?: string, emirates_id?: string }) {
  const { firmId, role } = await requireAuthAndFirm();
  if (!['admin', 'owner', 'managing_partner', 'manager'].includes(String(role).toLowerCase())) {
    throw new Error('Forbidden: Only managers/admins can update clients');
  }

  const clientRecord = await db.client.findUnique({ where: { id: clientId, firm_id: firmId } });
  if (!clientRecord) throw new Error("Client not found");

  // Update Client Record
  await db.client.update({
    where: { id: clientId },
    data: {
      name: data.name,
      phone: data.phone,
      passport_number: data.passport_number,
      emirates_id: data.emirates_id
    }
  });

  // If there's an associated Auth profile, update the full_name
  const profile = await db.profile.findUnique({ where: { email: clientRecord.email } });
  if (profile) {
    await db.profile.update({
      where: { id: profile.id },
      data: { full_name: data.name }
    });
    
    // Update Auth Metadata
    await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      user_metadata: { name: data.name }
    });
  }

  revalidatePath('/os/clients');
  return { success: true };
}

export async function deactivateClient(profileId: string) {
  const { firmId, role } = await requireAuthAndFirm();
  if (!['admin', 'owner', 'managing_partner', 'manager'].includes(String(role).toLowerCase())) {
    throw new Error('Forbidden: Only managers/admins can deactivate portal access');
  }

  // 1. Ban user in Auth layer (100 years)
  await supabaseAdmin.auth.admin.updateUserById(profileId, {
    ban_duration: '876000h'
  });

  // 2. Mark Profile as inactive
  await db.profile.update({
    where: { id: profileId },
    data: { is_active: false }
  });

  // 3. Mark Case Assignments as inactive
  await db.caseAssignment.updateMany({
    where: { user_id: profileId },
    data: { active: false }
  });

  revalidatePath('/os/clients');
  revalidatePath('/workspace');
  return { success: true };
}

export async function reactivateClient(profileId: string) {
  const { firmId, role } = await requireAuthAndFirm();
  if (!['admin', 'owner', 'managing_partner', 'manager'].includes(String(role).toLowerCase())) {
    throw new Error('Forbidden: Only managers/admins can reactivate portal access');
  }

  await supabaseAdmin.auth.admin.updateUserById(profileId, {
    ban_duration: 'none'
  });

  await db.profile.update({
    where: { id: profileId },
    data: { is_active: true }
  });

  revalidatePath('/os/clients');
  revalidatePath('/workspace');
  return { success: true };
}
