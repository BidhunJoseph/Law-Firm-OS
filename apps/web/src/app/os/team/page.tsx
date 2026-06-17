import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { TeamRosterClient } from "./TeamRosterClient";

export const dynamic = 'force-dynamic';

export default async function OSTeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await db.profile.findUnique({ where: { id: user.id } });
  if (!profile) return null;

  const firmUsers = await db.profile.findMany({
    where: { 
      firm_id: profile.firm_id,
      role: { not: 'client' }
    },
    include: {
      tasks_assigned_to: {
        where: { status: { not: 'completed' } }
      },
      case_assignments: {
        include: {
          case: {
            select: { id: true, title: true, current_status: true, risk_level: true, current_phase: true }
          }
        }
      }
    },
    orderBy: { role: 'asc' }
  });

  return <TeamRosterClient firmUsers={firmUsers} />;
}
