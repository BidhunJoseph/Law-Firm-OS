import 'server-only';
import { db } from '@/lib/db';
import { evaluateCaseRisk } from './situation-engine';
import type { EventType } from '@prisma/client';

export async function onCourtEventCreated(caseId: string, eventId: string, eventType: EventType, eventDate: Date, title: string) {
  // 1. Insert Timeline Event
  await db.timelineEvent.create({
    data: {
      case_id: caseId,
      event_date: eventDate,
      title: `Scheduled: ${title}`,
      description: `A new ${eventType} has been scheduled for ${eventDate.toLocaleDateString()}`,
      client_visible: true
    }
  });

  // 2. Fetch the case to find assignee
  const caseData = await db.case.findUnique({
    where: { id: caseId },
    select: { lawyer_id: true, paralegal_id: true }
  });

  if (caseData) {
    // 3. Auto-generate Tasks based on eventType
    const assignee = caseData.paralegal_id || caseData.lawyer_id;
    if (assignee) {
      let taskTitle = `Prepare for upcoming ${eventType}`;
      let daysBefore = 7;

      if (eventType === 'Trial') {
        taskTitle = 'Finalize Trial Binders & Exhibits';
        daysBefore = 14;
      } else if (eventType === 'Adjournment') {
        taskTitle = 'Notify Client of Adjournment & Update Calendar';
        daysBefore = 1;
      }

      const dueDate = new Date(eventDate);
      dueDate.setDate(dueDate.getDate() - daysBefore);

      await db.task.create({
        data: {
          case_id: caseId,
          assignee_id: assignee,
          title: taskTitle,
          description: `Auto-generated task triggered by: ${title}`,
          due_date: dueDate,
          status: 'pending'
        }
      });
    }
  }

  // 4. Re-evaluate Case Risk
  await evaluateCaseRisk(caseId);
}
