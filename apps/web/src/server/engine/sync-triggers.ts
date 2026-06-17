import 'server-only';
import { db } from '@/lib/db';
import { evaluateCaseRisk } from './situation-engine';

export async function onCourtEventCreated(caseId: string, eventId: string, eventType: string, eventDate: Date, title: string) {
  // Fetch the case to find the firm_id and assignments
  const caseData = await db.case.findUnique({
    where: { id: caseId },
    include: {
      assignments: true
    }
  });

  if (!caseData) return;
  const firmId = caseData.firm_id;

  // 1. Insert Timeline Event
  await db.timelineEvent.create({
    data: {
      firm_id: firmId,
      case_id: caseId,
      actor_type: 'court',
      event_type: 'court_event_created',
      title: `Scheduled: ${title}`,
      description: `A new ${eventType} has been scheduled for ${eventDate.toLocaleDateString()}`,
      client_visible: true
    }
  });

  // 2. Find Assignee (Paralegal first, then Lead Lawyer)
  const paralegal = caseData.assignments.find(a => a.assignment_role === 'paralegal');
  const lawyer = caseData.assignments.find(a => a.assignment_role === 'lead_lawyer');
  const assignee = paralegal?.user_id || lawyer?.user_id;

  if (assignee) {
    // 3. Auto-generate Tasks based on eventType
    let taskTitle = `Prepare for upcoming ${eventType}`;
    let daysBefore = 7;

    if (eventType.toLowerCase().includes('trial')) {
      taskTitle = 'Finalize Trial Binders & Exhibits';
      daysBefore = 14;
    } else if (eventType.toLowerCase().includes('adjournment')) {
      taskTitle = 'Notify Client of Adjournment & Update Calendar';
      daysBefore = 1;
    }

    const dueDate = new Date(eventDate);
    dueDate.setDate(dueDate.getDate() - daysBefore);

    await db.task.create({
      data: {
        firm_id: firmId,
        case_id: caseId,
        assigned_to: assignee,
        title: taskTitle,
        task_type: 'court_prep',
        description: `Auto-generated task triggered by: ${title}`,
        due_at: dueDate,
        status: 'open',
        priority: 'high'
      }
    });
  }

  // 4. Re-evaluate Case Risk
  await evaluateCaseRisk(caseId);
}
