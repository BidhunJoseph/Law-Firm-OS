import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { ChecklistHubClient } from "./ChecklistHubClient";

export const dynamic = 'force-dynamic';

export default async function OSDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await db.profile.findUnique({ where: { id: user.id } });
  if (!profile) return null;

  // As a manager, fetch all firm cases and their deep relations
  const cases = await db.case.findMany({
    where: { firm_id: profile.firm_id, current_status: { not: 'closed' } },
    include: {
      client: true,
      tasks: {
        orderBy: { created_at: 'asc' },
        include: { assignee: true }
      },
      assignments: {
        include: {
          user: true
        }
      },
      document_requests: true,
      documents: {
        orderBy: { created_at: 'desc' },
        include: { uploader: true }
      },
      court_events: {
        orderBy: { event_at: 'asc' }
      },
      timeline_events: {
        orderBy: { created_at: 'desc' }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  const firmUsers = await db.profile.findMany({
    where: { firm_id: profile.firm_id }
  });

  const firmClients = await db.client.findMany({
    where: { firm_id: profile.firm_id },
    orderBy: { name: 'asc' }
  });

  return (
    <ChecklistHubClient initialCases={cases} firmUsers={firmUsers} firmClients={firmClients} currentUser={profile} />
  );
}
