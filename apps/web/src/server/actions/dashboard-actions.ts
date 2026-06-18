'use server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

export async function getLawyerDashboardData() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  // Double check role
  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (profile?.role !== 'lawyer') throw new Error('Forbidden')

  const cases = await db.case.findMany({
    where: { 
      firm_id: profile.firm_id,
      assignments: { some: { user_id: user.id, active: true } }
    },
    include: {
      client: true,
      tasks: {
        where: { status: 'open' },
        orderBy: { due_at: 'asc' },
        include: { assignee: true }
      },
      court_events: {
        where: { event_at: { gte: new Date() } },
        orderBy: { event_at: 'asc' }
      },
      document_requests: {
        where: { status: 'under_review' }
      }
    }
  })

  return cases
}

export async function getParalegalDashboardData() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  // Double check role
  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (profile?.role !== 'paralegal') throw new Error('Forbidden')

  const tasks = await db.task.findMany({
    where: { firm_id: profile.firm_id, assigned_to: user.id },
    include: {
      case: {
        include: { client: true }
      }
    },
    orderBy: { due_at: 'asc' }
  })

  return tasks
}

export async function getParalegalCases() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return []
  
  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (!profile) return []

  const cases = await db.case.findMany({
    where: { 
      firm_id: profile.firm_id,
      assignments: { some: { user_id: user.id, active: true } } 
    },
    include: {
      client: true,
      tasks: {
        include: { assignee: true }
      }
    }
  })

  return cases
}

export async function getClientDashboardData() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  let firmId: string | undefined = undefined;
  let clientEmail = user.email!;

  const profile = await db.profile.findUnique({ where: { id: user.id } })
  
  if (profile) {
    firmId = profile.firm_id;
    clientEmail = profile.email;
  }

  const clientRecord = await db.client.findFirst({
    where: { email: clientEmail }
  })
  
  if (!clientRecord) return []

  // If no profile existed but we found a client, use their firm_id
  if (!firmId) {
    firmId = clientRecord.firm_id;
  }
  
  if (!firmId) throw new Error("Could not resolve firm ID.");

  const cases = await db.case.findMany({
    where: { firm_id: firmId, client_id: clientRecord.id },
    select: {
      id: true,
      title: true,
      current_status: true,
      current_phase: true,
      next_action: true,
      assignments: {
        where: { active: true },
        include: {
          user: {
            select: { full_name: true, email: true, role: true }
          }
        }
      },
      tasks: {
        where: { status: { in: ['open', 'in_progress'] } },
        include: {
          assignee: {
            select: { full_name: true, role: true }
          }
        }
      },
      timeline_events: {
        where: { client_visible: true },
        orderBy: { created_at: 'desc' }
      },
      document_requests: {
        where: { status: 'requested', requested_from_actor: 'client' }
      },
      court_events: {
        where: { event_at: { gte: new Date() } },
        orderBy: { event_at: 'asc' }
      }
    }
  })

  return cases
}

export async function submitDocumentMock(requestId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  await db.documentRequest.update({
    where: { id: requestId },
    data: { status: 'under_review' }
  });
}
