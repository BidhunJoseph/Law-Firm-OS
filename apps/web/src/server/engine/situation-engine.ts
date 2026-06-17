import 'server-only';
import { db } from '@/lib/db';

/**
 * Case Situation Engine: Evaluates the Risk Level of a given case
 * based on the continuous vector scoring model ($S = \max(S_D, S_M, S_I)$).
 */

export async function evaluateCaseRisk(caseId: string): Promise<string> {
  const caseData = await db.case.findUnique({
    where: { id: caseId },
    include: {
      court_events: {
        where: { event_at: { gte: new Date() } },
        orderBy: { event_at: 'asc' },
        take: 1
      },
      document_requests: {
        where: { status: 'pending' }
      },
      timeline_events: {
        orderBy: { created_at: 'desc' },
        take: 1
      }
    }
  });

  if (!caseData) throw new Error(`Case ${caseId} not found`);

  const now = new Date();

  // 1. D: Days until next deadline
  let D = Infinity;
  if (caseData.court_events.length > 0) {
    const nextEventDate = caseData.court_events[0].event_at;
    if (nextEventDate) {
      const diffTime = nextEventDate.getTime() - now.getTime();
      D = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  // 2. M: Count of missing documents
  const M = caseData.document_requests.length;

  // 3. I: Idle time (days since last timeline event or case creation)
  let I = 0;
  const lastActionDate = caseData.timeline_events.length > 0 
    ? caseData.timeline_events[0].created_at 
    : caseData.updated_at;
  
  const idleDiffTime = now.getTime() - lastActionDate.getTime();
  I = Math.ceil(idleDiffTime / (1000 * 60 * 60 * 24));

  // --- Calculate Vectors ---
  
  // $S_D$ (Deadline Vector)
  let SD = 0;
  if (D <= 0) SD = 100;
  else if (D <= 14) SD = 100 - ((D / 14) * 100);
  
  // $S_M$ (Missing Documents Vector)
  const SM = Math.min(M * 35, 100);

  // $S_I$ (Idle Time Vector)
  const SI = Math.min((I / 30) * 100, 100);

  // $S = \max(S_D, S_M, S_I)$
  const S = Math.max(SD, SM, SI);

  let newRiskLevel: string = 'low';

  if (S >= 50) newRiskLevel = 'high';
  else if (S >= 25) newRiskLevel = 'medium';
  else newRiskLevel = 'low';

  // Deep Sync: Calculate `next_action` based on current_phase
  let newNextAction = caseData.next_action;
  
  if (caseData.current_phase === 'intake') {
    newNextAction = 'Collect KYC / Conflict Check';
  } else if (caseData.current_phase === 'prospect') {
    newNextAction = 'Finalize Retainer Agreement';
  } else if (caseData.current_phase === 'active' && M > 0) {
    newNextAction = 'Awaiting Client Documents';
  } else if (D <= 14) {
    newNextAction = 'Prepare for Upcoming Court Deadline';
  }

  // Update DB if changed
  if (caseData.risk_level !== newRiskLevel || caseData.next_action !== newNextAction) {
    await db.case.update({
      where: { id: caseId },
      data: { 
        risk_level: newRiskLevel,
        next_action: newNextAction
      }
    });
  }

  return newRiskLevel;
}
