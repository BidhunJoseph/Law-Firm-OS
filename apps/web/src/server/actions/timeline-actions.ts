'use server';

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

  if (!profile || !profile.firm_id) {
    throw new Error("Firm not found for user");
  }

  return { userId: profile.id, firmId: profile.firm_id, role: profile.role };
}

export async function shiftCaseTimelines(caseId: string, daysOffset: number, shiftFromDateStr?: string) {
  try {
    const { firmId, userId, role } = await requireAuthAndFirm();

    const normalizedRole = role.toLowerCase();
    if (!['admin', 'manager', 'owner', 'managing_partner'].includes(normalizedRole)) {
      throw new Error(`Unauthorized: Role '${role}' cannot execute deep timeline shifts.`);
    }

    const tasks = await db.task.findMany({
      where: {
        case_id: caseId,
        firm_id: firmId,
        status: { notIn: ['completed', 'cancelled'] },
        due_at: { not: null },
        ...(shiftFromDateStr ? { due_at: { gte: new Date(shiftFromDateStr) } } : {})
      }
    });

    if (tasks.length === 0) {
      return { success: true, shiftedCount: 0 };
    }

    // Prisma doesn't have a direct "add days to datetime" bulk update, so we update sequentially
    // (In production with huge data, raw SQL is better, but this works for typical matter sizes)
    for (const task of tasks) {
      const newDue = new Date(task.due_at!);
      newDue.setDate(newDue.getDate() + daysOffset);

      await db.task.update({
        where: { id: task.id },
        data: { due_at: newDue }
      });
    }

    // Log the timeline shift
    const direction = daysOffset > 0 ? 'extended' : 'shortened';
    await db.timelineEvent.create({
      data: {
        firm_id: firmId,
        case_id: caseId,
        actor_user_id: userId,
        actor_type: 'manager',
        event_type: 'TIMELINE_SHIFTED',
        title: `Project Timelines ${direction === 'extended' ? 'Extended' : 'Shortened'}`,
        description: `Admin cascaded all open tasks by ${Math.abs(daysOffset)} days.`,
      }
    });

    revalidatePath(`/os/cases/${caseId}`);
    return { success: true, shiftedCount: tasks.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
