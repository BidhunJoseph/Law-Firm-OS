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

export async function addTask(data: { case_id: string; title: string; description?: string; phase_name?: string; due_at?: string; assigned_to?: string; }) {
  try {
    const { firmId, userId } = await requireAuthAndFirm();

    const taskTypeStr = data.phase_name ? data.phase_name.trim() : 'General';

    const task = await db.task.create({
      data: {
        firm_id: firmId,
        case_id: data.case_id,
        title: data.title,
        task_type: taskTypeStr,
        description: data.description || '',
        due_at: data.due_at ? new Date(data.due_at) : null,
        assigned_to: data.assigned_to || null,
        status: 'open',
        assigned_by: userId
      }
    });

    await db.timelineEvent.create({
      data: {
        firm_id: firmId,
        case_id: data.case_id,
        actor_user_id: userId,
        actor_type: 'manager',
        event_type: 'TASK_CREATED',
        title: 'Task Created',
        description: `New task added: ${task.title}`,
      }
    });

    revalidatePath(`/os/dashboard`);
    return { success: true, task };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTask(taskId: string, data: { title?: string; description?: string; status?: string; due_at?: string | null; assigned_to?: string | null; phase_name?: string; }) {
  try {
    const { firmId, userId } = await requireAuthAndFirm();

    const updateData: any = {
      title: data.title,
      description: data.description,
      status: data.status,
      due_at: data.due_at === null ? null : (data.due_at ? new Date(data.due_at) : undefined),
      assigned_to: data.assigned_to === null ? null : data.assigned_to,
      ...(data.status === 'completed' ? { completed_at: new Date() } : {})
    };

    if (data.phase_name !== undefined) {
      updateData.task_type = data.phase_name.trim();
    }

    const task = await db.task.update({
      where: { id: taskId, firm_id: firmId },
      data: updateData
    });

    if (data.status === 'completed') {
       await db.timelineEvent.create({
        data: {
          firm_id: firmId,
          case_id: task.case_id!,
          actor_user_id: userId,
          actor_type: 'lawyer',
          event_type: 'TASK_COMPLETED',
          title: 'Task Completed',
          description: `Task checked off: ${task.title}`,
        }
      });

      if (task.task_type === 'Case Closed') {
        const openTasks = await db.task.count({
          where: { case_id: task.case_id!, task_type: 'Case Closed', status: { not: 'completed' } }
        });
        if (openTasks === 0) {
          await db.case.update({
            where: { id: task.case_id! },
            data: { current_status: 'closed' }
          });
          await db.timelineEvent.create({
            data: {
              firm_id: firmId,
              case_id: task.case_id!,
              actor_user_id: userId,
              actor_type: 'system',
              event_type: 'CASE_CLOSED',
              title: 'Matter Formally Closed',
              description: 'The Case Closed phase was completed. The matter is now legally archived.',
            }
          });
        }
      }
    }

    revalidatePath(`/os/dashboard`);
    return { success: true, task };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const { firmId, role } = await requireAuthAndFirm();

    const normalizedRole = role.toLowerCase();
    if (!['admin', 'manager', 'owner', 'managing_partner'].includes(normalizedRole)) {
      throw new Error(`Unauthorized: Role '${role}' cannot delete tasks.`);
    }

    const task = await db.task.findUnique({ where: { id: taskId, firm_id: firmId } });
    if (!task) throw new Error("Task not found");

    await db.task.delete({
      where: { id: taskId, firm_id: firmId }
    });

    revalidatePath(`/os/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function renamePhaseTasks(caseId: string, oldPhaseName: string, newPhaseName: string) {
  try {
    const { firmId } = await requireAuthAndFirm();
    if (!newPhaseName.trim()) throw new Error("Phase name cannot be empty");

    await db.task.updateMany({
      where: { case_id: caseId, firm_id: firmId, task_type: oldPhaseName },
      data: { task_type: newPhaseName.trim() }
    });

    revalidatePath(`/os/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completePhaseTasks(caseId: string, phaseName: string) {
  try {
    const { firmId, userId } = await requireAuthAndFirm();

    const tasks = await db.task.findMany({
      where: { case_id: caseId, firm_id: firmId, task_type: phaseName, status: { not: 'completed' } }
    });

    await db.task.updateMany({
      where: { case_id: caseId, firm_id: firmId, task_type: phaseName, status: { not: 'completed' } },
      data: { status: 'completed', completed_at: new Date() }
    });

    if (tasks.length > 0) {
      await db.timelineEvent.create({
        data: {
          firm_id: firmId,
          case_id: caseId,
          actor_user_id: userId,
          actor_type: 'lawyer',
          event_type: 'PHASE_COMPLETED',
          title: 'Phase Completed',
          description: `All tasks in ${phaseName} were marked as completed.`,
        }
      });
    }

    if (phaseName === 'Case Closed') {
      await db.case.update({
        where: { id: caseId },
        data: { current_status: 'closed' }
      });
      await db.timelineEvent.create({
        data: {
          firm_id: firmId,
          case_id: caseId,
          actor_user_id: userId,
          actor_type: 'system',
          event_type: 'CASE_CLOSED',
          title: 'Matter Formally Closed',
          description: 'The Case Closed phase was completed. The matter is now legally archived.',
        }
      });
    }

    revalidatePath(`/os/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePhaseTasks(caseId: string, phaseName: string) {
  try {
    const { firmId, role } = await requireAuthAndFirm();

    const normalizedRole = role.toLowerCase();
    if (!['admin', 'manager', 'owner', 'managing_partner'].includes(normalizedRole)) {
      throw new Error(`Unauthorized: Role '${role}' cannot delete phases.`);
    }

    await db.task.deleteMany({
      where: { case_id: caseId, firm_id: firmId, task_type: phaseName }
    });

    revalidatePath(`/os/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function initializeEmptyPhase(caseId: string, phaseName: string) {
  try {
    const { firmId, userId } = await requireAuthAndFirm();
    if (!phaseName.trim()) throw new Error("Phase name cannot be empty");

    await db.task.create({
      data: {
        firm_id: firmId,
        case_id: caseId,
        title: `Initiate ${phaseName.trim()}`,
        task_type: phaseName.trim(),
        description: 'Initial task automatically generated for this phase.',
        status: 'open',
        assigned_by: userId
      }
    });

    revalidatePath(`/os/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
