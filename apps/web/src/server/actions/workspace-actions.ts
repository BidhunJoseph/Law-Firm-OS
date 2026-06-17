'use server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { runTaskCompletionTriggers } from '@/server/engine/automation-engine'
import { revalidatePath } from 'next/cache'

export async function getWorkspaceTasks() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Get user profile to check role and firm
  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true, firm_id: true }
  })

  if (!profile) throw new Error('Profile not found')
  const role = profile.role.toLowerCase()
  const isManagerOrAdmin = role === 'owner' || role === 'managing_partner' || role === 'manager'

  if (isManagerOrAdmin) {
    return await db.task.findMany({
      where: { firm_id: profile.firm_id },
      include: { case: true },
      orderBy: { due_at: 'asc' }
    })
  }

  // For lawyers and paralegals, show tasks assigned to them OR tasks on cases they are assigned to
  const tasks = await db.task.findMany({
    where: {
      firm_id: profile.firm_id,
      OR: [
        { assigned_to: user.id },
        { case: { assignments: { some: { user_id: user.id, active: true } } } }
      ]
    },
    include: { case: true },
    orderBy: { due_at: 'asc' }
  })

  return tasks
}

export async function getDocumentRequests() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { firm_id: true }
  })
  if (!profile) throw new Error('Profile not found')

  return await db.documentRequest.findMany({
    where: { firm_id: profile.firm_id },
    include: { case: true, requested_from: true, requester: true },
    orderBy: { created_at: 'desc' }
  })
}

const updateTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['open','in_progress','blocked','completed','cancelled','awaiting_review']),
})

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const parsed = updateTaskStatusSchema.safeParse({ taskId, status })
  if (!parsed.success) {
    throw new Error('Invalid input data')
  }

  // Ensure task exists and belongs to user (or user is admin)
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { case: { include: { assignments: true } } }
  })

  if (!task) throw new Error('Task not found')

  const profile = await db.profile.findUnique({
    where: { id: user.id }
  })

  if (!profile) throw new Error('Profile not found')

  const updatedTask = await db.task.update({
    where: { id: taskId },
    data: { 
      status: parsed.data.status,
      completed_at: parsed.data.status === 'completed' ? new Date() : null
    }
  })

  // Deep Synchronization: Trigger automation if task was completed
  if (parsed.data.status === 'completed') {
    await runTaskCompletionTriggers(taskId);
  }

  return updatedTask
}

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  due_at: z.date().optional(),
  case_id: z.string().uuid(),
  assigned_to: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  client_visible: z.boolean().optional().default(false),
})

export async function createTask(data: z.input<typeof createTaskSchema>) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const parsed = createTaskSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Invalid input data: ' + JSON.stringify(parsed.error.issues))
  }

  const profile = await db.profile.findUnique({
    where: { id: user.id }
  })
  if (!profile) throw new Error('Profile not found')

  const caseRecord = await db.case.findUnique({
    where: { id: parsed.data.case_id }
  })
  if (!caseRecord || caseRecord.firm_id !== profile.firm_id) {
    throw new Error('Unauthorized: Case does not belong to your firm')
  }

  if (parsed.data.assigned_to) {
    const assignee = await db.profile.findUnique({
      where: { id: parsed.data.assigned_to }
    })
    if (!assignee || assignee.firm_id !== profile.firm_id) {
      throw new Error('Unauthorized: Assignee does not belong to your firm')
    }
  }

  const newTask = await db.task.create({
    data: {
      firm_id: profile.firm_id,
      title: parsed.data.title,
      description: parsed.data.description,
      due_at: parsed.data.due_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      case_id: parsed.data.case_id,
      assigned_to: parsed.data.assigned_to || user.id,
      assigned_by: user.id,
      task_type: 'general',
      status: 'open',
      priority: parsed.data.priority,
      client_visible: parsed.data.client_visible
    }
  })

  return newTask
}

const createDocReqSchema = z.object({
  case_id: z.string().uuid(),
  document_type: z.string().min(1),
  requested_from_actor: z.string(),
  requested_from_user_id: z.string().uuid().optional(),
})

export async function createDocumentRequest(data: z.infer<typeof createDocReqSchema>) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const parsed = createDocReqSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid input')

  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (!profile) throw new Error('Profile not found')

  const docReq = await db.documentRequest.create({
    data: {
      firm_id: profile.firm_id,
      case_id: parsed.data.case_id,
      document_type: parsed.data.document_type,
      requested_from_actor: parsed.data.requested_from_actor,
      requested_from_user_id: parsed.data.requested_from_user_id,
      requested_by: user.id,
      status: 'requested',
    }
  })

  revalidatePath('/workspace')
  return docReq
}

export async function reviewDocumentRequest(requestId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (!profile) throw new Error('Profile not found')

  const docReq = await db.documentRequest.findUnique({ where: { id: requestId } })
  if (!docReq || docReq.firm_id !== profile.firm_id) throw new Error('Not found or unauthorized')

  const updatedReq = await db.documentRequest.update({
    where: { id: requestId },
    data: { status }
  })

  // Log timeline event
  await db.timelineEvent.create({
    data: {
      firm_id: profile.firm_id,
      case_id: docReq.case_id,
      actor_user_id: user.id,
      actor_type: profile.role,
      event_type: status === 'approved' ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED',
      title: `Document ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `Document of type ${docReq.document_type} was ${status}.`,
    }
  })

  revalidatePath('/workspace')
  return updatedReq
}

const createCourtNewsSchema = z.object({
  case_id: z.string().uuid(),
  event_type: z.string().min(1),
  client_update: z.string().optional(),
  next_date: z.string().optional(),
})

export async function createCourtNews(data: z.infer<typeof createCourtNewsSchema>) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const parsed = createCourtNewsSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid input')

  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (!profile) throw new Error('Profile not found')

  const eventDate = parsed.data.next_date ? new Date(parsed.data.next_date) : undefined

  const courtEvent = await db.courtEvent.create({
    data: {
      firm_id: profile.firm_id,
      case_id: parsed.data.case_id,
      event_type: parsed.data.event_type,
      client_update: parsed.data.client_update,
      event_at: new Date(),
      next_date: eventDate,
      created_by: user.id,
      responsible_user_id: user.id,
    }
  })

  // Update Case timeline/next date
  await db.case.update({
    where: { id: parsed.data.case_id },
    data: {
      next_court_date: eventDate,
      last_movement_at: new Date()
    }
  })

  await db.timelineEvent.create({
    data: {
      firm_id: profile.firm_id,
      case_id: parsed.data.case_id,
      actor_user_id: user.id,
      actor_type: profile.role,
      event_type: 'COURT_NEWS_INJECTED',
      title: 'Court Event Logged',
      description: `${parsed.data.event_type}: ${parsed.data.client_update || 'No extra info'}. Next Hearing: ${eventDate ? eventDate.toDateString() : 'N/A'}.`,
    }
  })

  revalidatePath('/workspace')
  revalidatePath(`/workspace/cases/${parsed.data.case_id}`)
  return courtEvent
}

