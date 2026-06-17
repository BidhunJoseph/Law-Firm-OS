import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { ClientRosterClient } from "./ClientRosterClient";

export const dynamic = 'force-dynamic';

export default async function OSClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await db.profile.findUnique({ where: { id: user.id } });
  if (!profile) return null;

  // We need both Client records and their corresponding Auth Profiles to check active status.
  // We'll fetch the Profile that matches the Client email to know if they are active in the portal.
  const clients = await db.client.findMany({
    where: { firm_id: profile.firm_id },
    include: {
      cases: {
        select: { id: true, title: true, current_status: true, risk_level: true, current_phase: true, tasks: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  const profiles = await db.profile.findMany({
    where: { firm_id: profile.firm_id, role: 'client' }
  });

  // Merge profile active status into clients
  const enrichedClients = clients.map(c => {
    const p = profiles.find(pr => pr.email === c.email);
    return {
      ...c,
      profile_id: p?.id || null,
      is_active: p ? p.is_active : false,
      active_cases: c.cases.filter(caseRec => caseRec.current_status !== 'closed').length
    };
  });

  return <ClientRosterClient initialClients={enrichedClients} />;
}
