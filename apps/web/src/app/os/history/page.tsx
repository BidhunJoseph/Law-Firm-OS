import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { HistoryHubClient } from "./HistoryHubClient";

export const dynamic = 'force-dynamic';

export default async function OSHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await db.profile.findUnique({ where: { id: user.id } });
  if (!profile) return null;

  const closedCases = await db.case.findMany({
    where: { firm_id: profile.firm_id, current_status: 'closed' },
    include: {
      client: true,
      tasks: {
        orderBy: { created_at: 'asc' }
      },
      assignments: {
        include: {
          user: true
        }
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

  return (
    <HistoryHubClient closedCases={closedCases} currentUser={profile} />
  );
}
