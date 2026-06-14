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
    where: { lawyer_id: user.id },
    include: {
      client: true,
      tasks: {
        where: { status: 'pending' },
        orderBy: { due_date: 'asc' }
      },
      court_events: {
        where: { event_date: { gte: new Date() } },
        orderBy: { event_date: 'asc' }
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
    where: { assignee_id: user.id },
    include: {
      case: {
        include: { client: true }
      }
    },
    orderBy: { due_date: 'asc' }
  })

  return tasks
}

export async function getClientDashboardData() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const cases = await db.case.findMany({
    where: { client_id: user.id }, // Note: client_id matches the Auth User ID for clients
    select: {
      id: true,
      case_code: true,
      title: true,
      status: true,
      lawyer: {
        select: { name: true, email: true }
      },
      timeline_events: {
        where: { client_visible: true },
        orderBy: { event_date: 'desc' }
      },
      document_requests: {
        where: { status: 'requested' }
      }
    }
  })

  return cases
}
