'use server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { TaskStatus } from '@prisma/client'
import { z } from 'zod'

export async function getWorkspaceTasks() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Get user profile to check role
  const profile = await db.profile.findUnique({
    where: { id: user.id },
    select: { role: true }
  })

  if (!profile) throw new Error('Profile not found')
  if (profile.role === 'admin') {
    return await db.task.findMany({
      include: { case: true },
      orderBy: { due_date: 'asc' }
    })
  }

  // For lawyers and paralegals, show tasks assigned to them OR tasks on cases they are assigned to
  const tasks = await db.task.findMany({
    where: {
      OR: [
        { assignee_id: user.id },
        { case: { lawyer_id: user.id } },
        { case: { paralegal_id: user.id } }
      ]
    },
    include: { case: true },
    orderBy: { due_date: 'asc' }
  })

  return tasks
}

const updateTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.nativeEnum(TaskStatus),
})

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
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
    include: { case: true }
  })

  if (!task) throw new Error('Task not found')

  const profile = await db.profile.findUnique({
    where: { id: user.id }
  })

  if (!profile) throw new Error('Profile not found')

  const role = String(profile.role).toLowerCase()
  const isManagerOrAdmin = role === 'admin' || role === 'manager'
  const isCaseOwner = task.case && (task.case.lawyer_id === user.id || task.case.paralegal_id === user.id)

  if (!isManagerOrAdmin && task.assignee_id !== user.id && !isCaseOwner) {
    throw new Error('Unauthorized: You can only update your own tasks')
  }

  const updatedTask = await db.task.update({
    where: { id: taskId },
    data: { status: parsed.data.status }
  })

  return updatedTask
}

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.date(),
  case_id: z.string().uuid(),
  assignee_id: z.string().uuid().optional(),
})

export async function createTask(data: z.infer<typeof createTaskSchema>) {
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

  const newTask = await db.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      due_date: parsed.data.due_date,
      case_id: parsed.data.case_id,
      assignee_id: parsed.data.assignee_id || user.id,
      status: 'pending'
    }
  })

  return newTask
}
