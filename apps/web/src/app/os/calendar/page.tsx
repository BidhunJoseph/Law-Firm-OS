import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { CourtCalendarClient } from "./CourtCalendarClient";

export const dynamic = 'force-dynamic';

export default async function OSCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await db.profile.findUnique({ where: { id: user.id } });
  if (!profile) return null;

  const events = await db.courtEvent.findMany({
    where: { firm_id: profile.firm_id },
    include: { case: true },
    orderBy: { event_at: 'asc' }
  });

  const cases = await db.case.findMany({
    where: { firm_id: profile.firm_id },
    select: { id: true, title: true }
  });

  return <CourtCalendarClient events={events} cases={cases} />;
}
