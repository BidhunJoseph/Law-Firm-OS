'use server';

import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function addCourtEvent(data: {
  case_id: string;
  event_type: string;
  court_name: string;
  event_at: string;
  internal_notes?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile) throw new Error("Profile not found");

    const matter = await db.case.findUnique({
      where: { id: data.case_id, firm_id: profile.firm_id }
    });

    if (!matter) throw new Error("Matter not found");

    const newEvent = await db.courtEvent.create({
      data: {
        firm_id: profile.firm_id,
        case_id: matter.id,
        event_type: data.event_type,
        court_name: data.court_name,
        event_at: new Date(data.event_at),
        internal_notes: data.internal_notes,
        created_by: profile.id
      }
    });

    // Write to audit ledger
    await db.auditLog.create({
      data: {
        firm_id: profile.firm_id,
        user_id: profile.id,
        entity_type: 'CourtEvent',
        entity_id: newEvent.id,
        action_type: 'create',
        after_data: JSON.parse(JSON.stringify(newEvent))
      }
    });

    await db.timelineEvent.create({
      data: {
        firm_id: profile.firm_id,
        case_id: matter.id,
        actor_user_id: profile.id,
        actor_type: 'lawyer',
        event_type: 'COURT_EVENT_LOGGED',
        title: 'Court Event Scheduled',
        description: `Scheduled ${data.event_type} at ${data.court_name} on ${new Date(data.event_at).toLocaleString()}`,
      }
    });

    return { success: true, event: newEvent };
  } catch (error: any) {
    console.error("addCourtEvent error:", error);
    return { success: false, error: error.message };
  }
}

export async function getCourtEvents() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile) throw new Error("Profile not found");

    const events = await db.courtEvent.findMany({
      where: { firm_id: profile.firm_id },
      include: {
        case: {
          include: {
            client: true
          }
        }
      },
      orderBy: { event_at: 'asc' }
    });

    return { success: true, events };
  } catch (error: any) {
    console.error("getCourtEvents error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCourtEvent(eventId: string, data: {
  event_type?: string;
  court_name?: string;
  event_at?: string;
  internal_notes?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile) throw new Error("Profile not found");

    const existingEvent = await db.courtEvent.findUnique({ where: { id: eventId, firm_id: profile.firm_id } });
    if (!existingEvent) throw new Error("Court event not found");

    const updateData: any = {};
    if (data.event_type !== undefined) updateData.event_type = data.event_type;
    if (data.court_name !== undefined) updateData.court_name = data.court_name;
    if (data.event_at !== undefined) updateData.event_at = new Date(data.event_at);
    if (data.internal_notes !== undefined) updateData.internal_notes = data.internal_notes;

    const updatedEvent = await db.courtEvent.update({
      where: { id: eventId },
      data: updateData
    });

    await db.auditLog.create({
      data: {
        firm_id: profile.firm_id,
        user_id: profile.id,
        entity_type: 'CourtEvent',
        entity_id: updatedEvent.id,
        action_type: 'update',
        before_data: JSON.parse(JSON.stringify(existingEvent)),
        after_data: JSON.parse(JSON.stringify(updatedEvent))
      }
    });

    await db.timelineEvent.create({
      data: {
        firm_id: profile.firm_id,
        case_id: updatedEvent.case_id!,
        actor_user_id: profile.id,
        actor_type: 'lawyer',
        event_type: 'COURT_EVENT_UPDATED',
        title: 'Court Event Updated',
        description: `Updated event: ${updatedEvent.event_type}`,
      }
    });

    return { success: true, event: updatedEvent };
  } catch (error: any) {
    console.error("updateCourtEvent error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCourtEvent(eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile) throw new Error("Profile not found");

    const existingEvent = await db.courtEvent.findUnique({ where: { id: eventId, firm_id: profile.firm_id } });
    if (!existingEvent) throw new Error("Court event not found");

    await db.courtEvent.delete({
      where: { id: eventId }
    });

    await db.auditLog.create({
      data: {
        firm_id: profile.firm_id,
        user_id: profile.id,
        entity_type: 'CourtEvent',
        entity_id: eventId,
        action_type: 'delete',
        before_data: JSON.parse(JSON.stringify(existingEvent))
      }
    });

    await db.timelineEvent.create({
      data: {
        firm_id: profile.firm_id,
        case_id: existingEvent.case_id!,
        actor_user_id: profile.id,
        actor_type: 'lawyer',
        event_type: 'COURT_EVENT_DELETED',
        title: 'Court Event Deleted',
        description: `Deleted event: ${existingEvent.event_type}`,
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("deleteCourtEvent error:", error);
    return { success: false, error: error.message };
  }
}
