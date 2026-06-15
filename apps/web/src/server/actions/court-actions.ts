'use server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { EventType, TaskStatus, RiskLevel } from '@prisma/client'
import { addDays } from 'date-fns'
import { z } from 'zod'

export async function getCourtEvents() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const profile = await db.profile.findUnique({
    where: { id: user.id }
  })
  if (!profile) throw new Error('Profile not found')

  if (profile.role === 'admin') {
    return await db.courtEvent.findMany({
      include: { case: true },
      orderBy: { event_date: 'asc' }
    })
  }

  // Only return events for cases this user is assigned to
  return await db.courtEvent.findMany({
    where: {
      case: {
        OR: [
          { lawyer_id: user.id },
          { paralegal_id: user.id }
        ]
      }
    },
    include: { case: true },
    orderBy: { event_date: 'asc' }
  })
}

const createCourtEventSchema = z.object({
  case_id: z.string().uuid(),
  event_date: z.date(),
  event_type: z.nativeEnum(EventType),
  title: z.string().min(1),
  description: z.string().optional(),
  metadata: z.any().optional(),
})

export type CreateCourtEventProps = z.infer<typeof createCourtEventSchema>

/**
 * Automates all downstream actions when a new court event is logged.
 * - Creates the CourtEvent record.
 * - Broadcasts a TimelineEvent to the Client Portal.
 * - Spawns relevant tasks for the assigned Paralegal/Lawyer.
 * - Adjusts Risk Level based on rules.
 */
export async function createCourtEvent(data: CreateCourtEventProps) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const parsed = createCourtEventSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid input data')
  const validData = parsed.data

  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (!profile || (profile.role !== 'admin' && profile.role !== 'lawyer' && profile.role !== 'paralegal')) {
    throw new Error('Unauthorized role')
  }

  // Execute all logic in a single atomic transaction
  const result = await db.$transaction(async (tx) => {
    // 1. Fetch case details to know who to assign tasks to
    const caseData = await tx.case.findUnique({
      where: { id: validData.case_id }
    });
    
    if (!caseData) throw new Error("Case not found");

    if (profile.role !== 'admin' && caseData.lawyer_id !== user.id && caseData.paralegal_id !== user.id) {
      throw new Error('Unauthorized: You are not assigned to this case')
    }

    // 2. Create the Court Event
    const courtEvent = await tx.courtEvent.create({
      data: {
        case_id: validData.case_id,
        event_date: validData.event_date,
        event_type: validData.event_type,
        title: validData.title,
        description: validData.description,
        metadata: validData.metadata || {}
      }
    });

    // 3. Auto-publish a Client-Visible Timeline Event
    await tx.timelineEvent.create({
      data: {
        case_id: validData.case_id,
        event_date: validData.event_date,
        title: `Court Update: ${validData.title}`,
        description: validData.description,
        client_visible: true
      }
    });

    // 4. Matrix Rules based on Event Type
    const tasksToCreate = [];
    let riskUpdate: RiskLevel | undefined = undefined;

    switch (validData.event_type) {
      case 'Adjournment':
        // If adjourned, spawn task for Paralegal to get new dates
        if (caseData.paralegal_id) {
          tasksToCreate.push({
            case_id: validData.case_id,
            assignee_id: caseData.paralegal_id,
            title: 'Reschedule Adjourned Hearing',
            description: `Follow up with clerk to get new dates for ${validData.title}`,
            due_date: addDays(new Date(), 2),
            status: TaskStatus.pending
          });
        }
        riskUpdate = RiskLevel.medium; // Adjournments elevate risk slightly
        break;

      case 'Hearing':
        // Pre-hearing prep task for lawyer
        tasksToCreate.push({
          case_id: validData.case_id,
          assignee_id: caseData.lawyer_id,
          title: 'Prepare Hearing Arguments',
          description: `Review documents for upcoming hearing: ${validData.title}`,
          due_date: addDays(validData.event_date, -3),
          status: TaskStatus.pending
        });
        
        // Post-hearing filing task for paralegal
        if (caseData.paralegal_id) {
          tasksToCreate.push({
            case_id: validData.case_id,
            assignee_id: caseData.paralegal_id,
            title: 'File Hearing Summary Notes',
            description: `Digitize lawyer notes from hearing: ${validData.title}`,
            due_date: addDays(validData.event_date, 1),
            status: TaskStatus.pending
          });
        }
        break;

      case 'Trial':
        riskUpdate = RiskLevel.high; // Trials are automatically high risk
        tasksToCreate.push({
          case_id: validData.case_id,
          assignee_id: caseData.lawyer_id,
          title: 'Final Trial Preparation',
          description: `Comprehensive trial review. Ensure all evidence vectors are mapped.`,
          due_date: addDays(validData.event_date, -7),
          status: TaskStatus.pending
        });
        break;
    }

    // Insert Tasks
    const validTasks = tasksToCreate.filter(t => t.assignee_id != null) as any[];
    if (validTasks.length > 0) {
      await tx.task.createMany({ data: validTasks });
    }

    // Update Case Risk Level if rules fired
    if (riskUpdate) {
      await tx.case.update({
        where: { id: validData.case_id },
        data: { risk_level: riskUpdate }
      });
    }

    return courtEvent;
  });

  return result;
}
