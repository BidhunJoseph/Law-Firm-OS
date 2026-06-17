'use server';

import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { runCaseCreationTriggers } from '../engine/automation-engine';
import { provisionUser } from './user-actions';

/**
 * ----------------------------------------------------
 * Core Authentication & RLS Security Helper
 * ----------------------------------------------------
 */
async function requireAuthAndFirm() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) throw new Error("Unauthorized");

  let profile = await db.profile.findUnique({
    where: { id: session.user.id }
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  if (!profile.firm_id) throw new Error("Firm not found for user");
  return { userId: profile.id, firmId: profile.firm_id, role: profile.role };
}

/**
 * ----------------------------------------------------
 * Schemas
 * ----------------------------------------------------
 */
const createMatterSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  client_id: z.string().optional(),
  client_name: z.string().optional(),
  client_email: z.string().email().optional(),
  client_phone: z.string().optional(),
  client_passport: z.string().optional(),
  client_emirates_id: z.string().optional(),
  case_type: z.string().min(1, "Case type is required"),
  risk_level: z.enum(['green', 'amber', 'red', 'critical']).default('green'),
  description: z.string().optional(),
  lawyer_id: z.string().optional(),
  paralegal_id: z.string().optional(),
});

/**
 * ----------------------------------------------------
 * Case Creation (A-to-Z Intact Loop)
 * ----------------------------------------------------
 */
export async function createMatter(data: z.infer<typeof createMatterSchema>) {
  try {
    const { userId, firmId } = await requireAuthAndFirm();
    const parsed = createMatterSchema.parse(data);

    // 1. Resolve Client
    let finalClientId = parsed.client_id;
    if (finalClientId) {
      const existingClient = await db.client.findUnique({
        where: { id: finalClientId }
      });
      if (!existingClient || existingClient.firm_id !== firmId) {
        throw new Error("Invalid client ID. Client does not exist or does not belong to your firm.");
      }
    } else if (parsed.client_name && parsed.client_email) {
      const existingClient = await db.client.findFirst({
        where: { firm_id: firmId, email: parsed.client_email }
      });

      if (existingClient) {
        finalClientId = existingClient.id;
      } else {
        // Provision the user as a client, giving them full portal access
        await provisionUser({
          name: parsed.client_name,
          email: parsed.client_email,
          phone: parsed.client_phone || '',
          passport_number: parsed.client_passport || '',
          emirates_id: parsed.client_emirates_id || '',
          role: 'client'
        });

        // Fetch the newly created client record
        const newlyCreatedClient = await db.client.findFirst({
          where: { firm_id: firmId, email: parsed.client_email }
        });

        if (newlyCreatedClient) {
          finalClientId = newlyCreatedClient.id;
        }
      }
    }

    if (!finalClientId) {
      throw new Error("Client resolution failed. Provide an existing client or valid details to create one.");
    }

    // 2. Generate Case Code & Create Case with Retry
    let newCase;
    let retries = 0;
    while (retries < 3) {
      try {
        const count = await db.case.count({ where: { firm_id: firmId } });
        // Add random suffix if retrying to avoid race conditions
        const case_code = `MAT-${new Date().getFullYear()}-${String(count + 1 + retries).padStart(4, '0')}`;
        const caseId = crypto.randomUUID();

        newCase = await db.case.create({
          data: {
            id: caseId,
            firm_id: firmId,
            client_id: finalClientId,
            case_code,
            title: parsed.title,
            case_type: parsed.case_type,
            current_status: 'open',
            risk_level: parsed.risk_level,
            created_by: userId,
          }
        });
        break; // Success
      } catch (e: any) {
        if (e.code === 'P2002') { // Unique constraint violation (race condition)
          retries++;
          continue;
        }
        throw e;
      }
    }

    if (!newCase) {
      throw new Error("Failed to generate a unique case code after multiple attempts. Please try again.");
    }
    const caseId = newCase.id;

    // 4. Create Case Assignments
    const assignments = [];
    if (parsed.lawyer_id) {
      const lawyer = await db.profile.findUnique({ where: { id: parsed.lawyer_id } });
      if (!lawyer || lawyer.firm_id !== firmId) throw new Error("Lawyer not in firm");
      assignments.push({
        firm_id: firmId,
        case_id: caseId,
        user_id: parsed.lawyer_id,
        assignment_role: 'lead_lawyer',
      });
    }
    if (parsed.paralegal_id) {
      const paralegal = await db.profile.findUnique({ where: { id: parsed.paralegal_id } });
      if (!paralegal || paralegal.firm_id !== firmId) throw new Error("Paralegal not in firm");
      assignments.push({
        firm_id: firmId,
        case_id: caseId,
        user_id: parsed.paralegal_id,
        assignment_role: 'paralegal',
      });
    }

    if (assignments.length > 0) {
      await db.caseAssignment.createMany({ data: assignments });
    }

    // 5. UAE Law Task Generation
    const { generateTasksForMatter } = await import('../engine/uae-law-engine');
    const primaryAssignee = parsed.lawyer_id || parsed.paralegal_id;
    await generateTasksForMatter(caseId, parsed.case_type, firmId, userId, primaryAssignee);

    // 6. Fire Workflow Engine
    await runCaseCreationTriggers(caseId, parsed.case_type, firmId, parsed.lawyer_id);

    revalidatePath('/workspace');
    revalidatePath('/manager/dashboard');
    return { success: true, caseId: newCase.id };

  } catch (error: any) {
    console.error("Failed to create matter:", error);
    return { success: false, error: error.message };
  }
}

/**
 * ----------------------------------------------------
 * Retrieve Manager Dashboard Data
 * ----------------------------------------------------
 */
export async function getManagerDashboardData() {
  const { userId, firmId } = await requireAuthAndFirm();

  const [cases, timelineEvents] = await Promise.all([
    db.case.findMany({
      where: { firm_id: firmId },
      include: {
        client: true,
        assignments: {
          include: {
            user: true
          }
        },
        tasks: true,
        documents: true,
        court_events: true
      },
      orderBy: { created_at: 'desc' }
    }),
    db.timelineEvent.findMany({
      where: { firm_id: firmId },
      include: {
        case: { select: { title: true, case_code: true } },
        actor: { select: { full_name: true, role: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 25
    })
  ]);

  // Re-map the structure so the frontend logic doesn't break
  const mappedCases = cases.map(c => {
    const leadLawyerAssign = c.assignments.find(a => a.assignment_role === 'lead_lawyer' || a.user.role === 'lawyer');
    const paralegalAssign = c.assignments.find(a => a.assignment_role === 'paralegal' || a.user.role === 'paralegal');

    return {
      ...c,
      lawyer: leadLawyerAssign ? leadLawyerAssign.user : null,
      paralegal: paralegalAssign ? paralegalAssign.user : null,
      overdue_tasks: c.tasks.filter(t => t.due_at && t.due_at < new Date() && t.status !== 'completed').length,
    };
  });

  return {
    success: true,
    data: {
      metrics: {
        totalActive: mappedCases.filter(c => c.current_status !== 'closed').length,
        criticalRisk: mappedCases.filter(c => c.risk_level === 'critical' || c.risk_level === 'red').length,
        pendingClientDocs: mappedCases.reduce((acc, c) => acc + c.documents.filter(d => d.review_status === 'pending').length, 0),
        upcomingHearings: mappedCases.reduce((acc, c) => acc + c.court_events.filter(e => e.event_at && e.event_at > new Date()).length, 0)
      },
      cases: mappedCases,
      timelineEvents
    }
  };
}

/**
 * ----------------------------------------------------
 * Get A Single Case Details
 * ----------------------------------------------------
 */
export async function getCase(id: string) {
  const { firmId } = await requireAuthAndFirm();

  const caseRecord = await db.case.findUnique({
    where: { id, firm_id: firmId },
    include: {
      client: true,
      assignments: {
        include: { user: true }
      },
      timeline_events: { orderBy: { created_at: 'desc' } },
      tasks: { orderBy: { due_at: 'asc' }, include: { assignee: true } },
      court_events: { orderBy: { event_at: 'asc' } },
      documents: { orderBy: { created_at: 'desc' } }
    }
  });

  if (!caseRecord) return null;

  const leadLawyerAssign = caseRecord.assignments.find(a => a.assignment_role === 'lead_lawyer' || a.user.role === 'lawyer');
  const paralegalAssign = caseRecord.assignments.find(a => a.assignment_role === 'paralegal' || a.user.role === 'paralegal');

  return {
    ...caseRecord,
    lawyer: leadLawyerAssign ? leadLawyerAssign.user : null,
    paralegal: paralegalAssign ? paralegalAssign.user : null,
  };
}

export async function submitKYCForm(clientId: string, taskId: string, caseId: string, data: { passport_number: string, emirates_id: string }) {
  try {
    const { firmId, userId } = await requireAuthAndFirm();

    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client || client.firm_id !== firmId) throw new Error("Unauthorized client update");

    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task || task.firm_id !== firmId) throw new Error("Unauthorized task update");
    if (task.case_id !== caseId) throw new Error("Task does not belong to case");

    const caseRecord = await db.case.findUnique({ where: { id: caseId } });
    if (!caseRecord || caseRecord.firm_id !== firmId) throw new Error("Case not found");

    await db.client.update({
      where: { id: clientId },
      data: {
        passport_number: data.passport_number,
        emirates_id: data.emirates_id
      }
    });

    await db.task.update({
      where: { id: taskId, firm_id: firmId },
      data: {
        status: 'completed',
        completed_at: new Date()
      }
    });

    await db.timelineEvent.create({
      data: {
        firm_id: firmId,
        case_id: caseId,
        actor_user_id: userId,
        actor_type: 'paralegal',
        event_type: 'KYC_UPDATED',
        title: 'KYC Documents Processed',
        description: 'Passport and ID details have been logged into the system.',
      }
    });

    revalidatePath(`/workspace/cases/${caseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function advanceCasePhase(caseId: string, newPhase: string) {
  try {
    const { firmId, userId, role } = await requireAuthAndFirm();

    const normalizedRole = role.toLowerCase();
    if (!['admin', 'manager', 'owner', 'managing_partner'].includes(normalizedRole)) {
      throw new Error(`Unauthorized: Role '${role}' cannot advance case phases. Only admins or managers are permitted.`);
    }

    await db.case.update({
      where: { id: caseId, firm_id: firmId },
      data: { current_phase: newPhase, last_movement_at: new Date() }
    });

    await db.timelineEvent.create({
      data: {
        firm_id: firmId,
        case_id: caseId,
        actor_user_id: userId,
        actor_type: 'lawyer',
        event_type: 'PHASE_CHANGED',
        title: 'Matter Phase Advanced',
        description: `Matter was moved to Phase: ${newPhase}`,
      }
    });

    revalidatePath(`/workspace/cases/${caseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function updateMatterPhase(caseId: string, newPhase: string) {
  return advanceCasePhase(caseId, newPhase);
}

export async function getCases() {
  const { firmId } = await requireAuthAndFirm();

  const cases = await db.case.findMany({
    where: { firm_id: firmId },
    include: {
      client: true,
      assignments: {
        include: { user: true }
      },
      tasks: true,
      documents: true,
      court_events: true
    },
    orderBy: { created_at: 'desc' }
  });

  return cases.map(c => {
    const leadLawyerAssign = c.assignments.find(a => a.assignment_role === 'lead_lawyer' || a.user.role === 'lawyer');
    const paralegalAssign = c.assignments.find(a => a.assignment_role === 'paralegal' || a.user.role === 'paralegal');

    return {
      ...c,
      lawyer: leadLawyerAssign ? leadLawyerAssign.user : null,
      paralegal: paralegalAssign ? paralegalAssign.user : null,
    };
  });
}

export async function closeCaseManually(caseId: string) {
  try {
    const { firmId, userId, role } = await requireAuthAndFirm();

    const normalizedRole = role.toLowerCase();
    if (!['admin', 'manager', 'owner', 'managing_partner'].includes(normalizedRole)) {
      throw new Error(`Unauthorized: Role '${role}' cannot close matters manually.`);
    }

    await db.case.update({
      where: { id: caseId, firm_id: firmId },
      data: { current_status: 'closed' }
    });

    await db.timelineEvent.create({
      data: {
        firm_id: firmId,
        case_id: caseId,
        actor_user_id: userId,
        actor_type: 'manager',
        event_type: 'CASE_CLOSED_MANUALLY',
        title: 'Matter Force Closed',
        description: `Matter was manually archived and closed by the administrator.`,
      }
    });

    revalidatePath(`/os/dashboard`);
    revalidatePath(`/os/history`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reopenCase(caseId: string) {
  try {
    const { firmId, userId, role } = await requireAuthAndFirm();

    const normalizedRole = role.toLowerCase();
    if (!['admin', 'manager', 'owner', 'managing_partner'].includes(normalizedRole)) {
      throw new Error(`Unauthorized: Role '${role}' cannot reopen matters.`);
    }

    await db.case.update({
      where: { id: caseId, firm_id: firmId },
      data: { current_status: 'open' }
    });

    await db.timelineEvent.create({
      data: {
        firm_id: firmId,
        case_id: caseId,
        actor_user_id: userId,
        actor_type: 'manager',
        event_type: 'CASE_REOPENED',
        title: 'Matter Re-opened',
        description: `Matter was restored from archives and re-opened for execution.`,
      }
    });

    revalidatePath(`/os/dashboard`);
    revalidatePath(`/os/history`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
