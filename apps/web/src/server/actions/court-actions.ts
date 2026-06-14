'use server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { EventType, TaskStatus, RiskLevel } from '@prisma/client'
import { addDays } from 'date-fns'

interface TriggerCourtEventProps {
  case_id: string;
  event_date: Date;
  event_type: EventType;
  title: string;
  description?: string;
  metadata?: any;
}

/**
 * Automates all downstream actions when a new court event is logged.
 * - Creates the CourtEvent record.
 * - Broadcasts a TimelineEvent to the Client Portal.
 * - Spawns relevant tasks for the assigned Paralegal/Lawyer.
 * - Adjusts Risk Level based on rules.
 */
export async function triggerCourtEvent(data: TriggerCourtEventProps) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Execute all logic in a single atomic transaction
  const result = await db.$transaction(async (tx) => {
    // 1. Fetch case details to know who to assign tasks to
    const caseData = await tx.case.findUnique({
      where: { id: data.case_id }
    });
    
    if (!caseData) throw new Error("Case not found");

    // 2. Create the Court Event
    const courtEvent = await tx.courtEvent.create({
      data: {
        case_id: data.case_id,
        event_date: data.event_date,
        event_type: data.event_type,
        title: data.title,
        description: data.description,
        metadata: data.metadata || {}
      }
    });

    // 3. Auto-publish a Client-Visible Timeline Event
    await tx.timelineEvent.create({
      data: {
        case_id: data.case_id,
        event_date: data.event_date,
        title: `Court Update: ${data.title}`,
        description: data.description,
        client_visible: true
      }
    });

    // 4. Matrix Rules based on Event Type
    const tasksToCreate = [];
    let riskUpdate: RiskLevel | undefined = undefined;

    switch (data.event_type) {
      case 'Adjournment':
        // If adjourned, spawn task for Paralegal to get new dates
        if (caseData.paralegal_id) {
          tasksToCreate.push({
            case_id: data.case_id,
            assignee_id: caseData.paralegal_id,
            title: 'Reschedule Adjourned Hearing',
            description: `Follow up with clerk to get new dates for ${data.title}`,
            due_date: addDays(new Date(), 2),
            status: TaskStatus.pending
          });
        }
        riskUpdate = RiskLevel.medium; // Adjournments elevate risk slightly
        break;

      case 'Hearing':
        // Pre-hearing prep task for lawyer
        tasksToCreate.push({
          case_id: data.case_id,
          assignee_id: caseData.lawyer_id,
          title: 'Prepare Hearing Arguments',
          description: `Review documents for upcoming hearing: ${data.title}`,
          due_date: addDays(data.event_date, -3),
          status: TaskStatus.pending
        });
        
        // Post-hearing filing task for paralegal
        if (caseData.paralegal_id) {
          tasksToCreate.push({
            case_id: data.case_id,
            assignee_id: caseData.paralegal_id,
            title: 'File Hearing Summary Notes',
            description: `Digitize lawyer notes from hearing: ${data.title}`,
            due_date: addDays(data.event_date, 1),
            status: TaskStatus.pending
          });
        }
        break;

      case 'Trial':
        riskUpdate = RiskLevel.high; // Trials are automatically high risk
        tasksToCreate.push({
          case_id: data.case_id,
          assignee_id: caseData.lawyer_id,
          title: 'Final Trial Preparation',
          description: `Comprehensive trial review. Ensure all evidence vectors are mapped.`,
          due_date: addDays(data.event_date, -7),
          status: TaskStatus.pending
        });
        break;
    }

    // Insert Tasks
    if (tasksToCreate.length > 0) {
      await tx.task.createMany({ data: tasksToCreate });
    }

    // Update Case Risk Level if rules fired
    if (riskUpdate) {
      await tx.case.update({
        where: { id: data.case_id },
        data: { risk_level: riskUpdate }
      });
    }

    return courtEvent;
  });

  return result;
}
