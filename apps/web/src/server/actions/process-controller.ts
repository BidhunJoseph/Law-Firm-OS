'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * ----------------------------------------------------
 * The Process Controller State Machine
 * ----------------------------------------------------
 * This replaces scattered logic in `case-actions.ts` and `automation-engine.ts`.
 * It strictly dictates what happens when a case moves from Phase A to Phase B.
 */

// 1. Strict State Definitions
export const CASE_STATES = [
  "1. Intake & KYC",
  "2. Strategy & Preparation",
  "3. Active Litigation",
  "4. Judgment & Execution",
  "5. Closed"
] as const;

export type CaseState = typeof CASE_STATES[number];

const STATE_TRANSITION_MAP: Record<CaseState, CaseState[]> = {
  "1. Intake & KYC": ["2. Strategy & Preparation", "5. Closed"],
  "2. Strategy & Preparation": ["3. Active Litigation", "5. Closed"],
  "3. Active Litigation": ["4. Judgment & Execution", "5. Closed"],
  "4. Judgment & Execution": ["5. Closed"],
  "5. Closed": ["2. Strategy & Preparation"], // Allowed to reopen
};

async function requireAuthAndFirm() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) throw new Error("Unauthorized");

  const profile = await db.profile.findUnique({
    where: { id: session.user.id }
  });

  if (!profile || !profile.firm_id) throw new Error("Profile or firm not found");
  
  return { userId: profile.id, firmId: profile.firm_id, role: profile.role };
}

/**
 * Core function to Advance the Case State and trigger automatic delegation
 */
export async function advanceProcessState(caseId: string, targetState: CaseState) {
  const { firmId, userId, role } = await requireAuthAndFirm();

  // Validate Authorization
  const normalizedRole = role.toLowerCase();
  if (!['admin', 'manager', 'owner', 'managing_partner'].includes(normalizedRole)) {
    throw new Error(`Forbidden: Role '${role}' cannot advance process states.`);
  }

  // Fetch Current State
  const matter = await db.case.findUnique({
    where: { id: caseId, firm_id: firmId },
    include: {
      assignments: true,
      client: true
    }
  });

  if (!matter) throw new Error("Matter not found");

  const currentState = matter.current_phase as CaseState;

  // Enforce State Machine Rules (Bypass check if the current state isn't mapped yet, allowing migration from legacy states)
  if (STATE_TRANSITION_MAP[currentState] && !STATE_TRANSITION_MAP[currentState].includes(targetState)) {
    throw new Error(`Invalid Transition: Cannot move from ${currentState} to ${targetState}`);
  }

  // Find assigned actors for delegation
  const leadLawyerAssign = matter.assignments.find(a => a.assignment_role === 'lead_lawyer');
  const paralegalAssign = matter.assignments.find(a => a.assignment_role === 'paralegal');

  const lawyerId = leadLawyerAssign?.user_id;
  const paralegalId = paralegalAssign?.user_id;

  // 1. Advance the State Database Record
  await db.case.update({
    where: { id: caseId },
    data: { 
      current_phase: targetState,
      last_movement_at: new Date()
    }
  });

  // 2. Generate Automated Delegation Tasks based on the new Phase
  await triggerStateDelegation(matter.id, targetState, firmId, {
    lawyerId, 
    paralegalId, 
    clientId: undefined // We'll skip assignment here to fix the type issue for now since we don't have a direct user_id on Client in this query
  });

  // 3. Log Immutable Timeline Event
  await db.timelineEvent.create({
    data: {
      firm_id: firmId,
      case_id: caseId,
      actor_user_id: userId,
      actor_type: 'manager',
      event_type: 'PHASE_CHANGED',
      title: 'Matter State Transitioned',
      description: `Process Controller advanced matter to: ${targetState}`,
      client_visible: true
    }
  });

  revalidatePath(`/workspace/cases/${caseId}`);
  revalidatePath('/manager/dashboard');
  return { success: true, newState: targetState };
}

/**
 * Automates the generation of tasks and document requests when a case enters a new state.
 */
async function triggerStateDelegation(
  caseId: string, 
  state: CaseState, 
  firmId: string, 
  actors: { lawyerId?: string, paralegalId?: string, clientId?: string }
) {
  const tasksToCreate = [];
  const now = new Date();

  if (state === "1. Intake & KYC") {
    if (actors.paralegalId) {
      tasksToCreate.push({
        firm_id: firmId,
        case_id: caseId,
        title: "Complete KYC Verification",
        task_type: "Administrative",
        description: "Verify client identification and update system records.",
        priority: "high",
        assigned_to: actors.paralegalId,
        due_at: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000) // 1 day
      });
    }
    if (actors.clientId) {
      tasksToCreate.push({
        firm_id: firmId,
        case_id: caseId,
        title: "Upload Initial Documents",
        task_type: "ClientAction",
        description: "Please upload your ID and relevant case documents to the portal.",
        priority: "high",
        assigned_to: actors.clientId,
        client_visible: true,
        due_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
      });
    }
  }

  if (state === "2. Strategy & Preparation") {
    if (actors.lawyerId) {
      tasksToCreate.push({
        firm_id: firmId,
        case_id: caseId,
        title: "Draft Initial Strategy Memo",
        task_type: "Legal",
        description: "Review KYC documents and draft the initial legal strategy approach.",
        priority: "high",
        assigned_to: actors.lawyerId,
        due_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
      });
    }
    if (actors.paralegalId) {
      tasksToCreate.push({
        firm_id: firmId,
        case_id: caseId,
        title: "Index Evidence Vault",
        task_type: "Administrative",
        description: "Organize client uploads into structured evidence folders.",
        priority: "medium",
        assigned_to: actors.paralegalId,
        due_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days
      });
    }
  }

  if (state === "3. Active Litigation") {
    if (actors.lawyerId) {
      tasksToCreate.push({
        firm_id: firmId,
        case_id: caseId,
        title: "File Court Memorandum",
        task_type: "Legal",
        description: "Submit the primary memorandums to the relevant court.",
        priority: "critical",
        assigned_to: actors.lawyerId,
        due_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }
  }

  if (tasksToCreate.length > 0) {
    await db.task.createMany({ data: tasksToCreate });
  }
}
