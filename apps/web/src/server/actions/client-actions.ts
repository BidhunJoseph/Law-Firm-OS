"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function getClients() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const clients = await db.client.findMany({
    include: {
      _count: {
        select: { cases: true }
      }
    },
    orderBy: {
      created_at: "desc"
    }
  });

  return clients;
}

export async function getClientDetails(id: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const client = await db.client.findUnique({
    where: { id },
    include: {
      cases: {
        include: {
          lawyer: true,
          paralegal: true
        },
        orderBy: { created_at: "desc" }
      }
    }
  });

  if (!client) throw new Error("Client not found");

  // Also fetch documents associated with their cases
  const documents = await db.document.findMany({
    where: {
      case_id: { in: client.cases.map(c => c.id) }
    },
    include: {
      case: true
    },
    orderBy: { created_at: "desc" }
  });

  return { client, documents };
}
