'use server'

import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CaseStatus, RiskLevel } from '@lawfirm/database'

export async function getCases() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) throw new Error('Unauthorized')
  
  // Scope by role
  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (!profile) throw new Error('Profile not found')

  if (profile.role === 'admin') {
    return db.case.findMany({ include: { client: true, lawyer: true, paralegal: true }, orderBy: { created_at: 'desc' } })
  } else if (profile.role === 'lawyer') {
    return db.case.findMany({ 
      where: { lawyer_id: user.id },
      include: { client: true, lawyer: true, paralegal: true },
      orderBy: { created_at: 'desc' }
    })
  } else if (profile.role === 'paralegal') {
    return db.case.findMany({ 
      where: { paralegal_id: user.id },
      include: { client: true, lawyer: true, paralegal: true },
      orderBy: { created_at: 'desc' }
    })
  }
  
  return []
}

export async function getCase(id: string) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) throw new Error('Unauthorized')

  const caseItem = await db.case.findUnique({
    where: { id },
    include: { client: true, lawyer: true, paralegal: true }
  })
  
  if (!caseItem) throw new Error('Case not found')

  // Access check
  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (profile?.role !== 'admin' && caseItem.lawyer_id !== user.id && caseItem.paralegal_id !== user.id) {
    throw new Error('Forbidden')
  }

  return caseItem
}

export type CreateCaseInput = {
  title: string
  client_id: string
  lawyer_id: string
  paralegal_id?: string | null
  status: CaseStatus
  risk_level?: RiskLevel | null
  internal_notes?: string | null
}

export async function createCase(data: CreateCaseInput) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) throw new Error('Unauthorized')

  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (profile?.role !== 'admin') throw new Error('Forbidden: Only admins can create cases')

  const newCase = await db.case.create({
    data
  })
  
  revalidatePath('/workspace')
  revalidatePath('/manager')
  return newCase
}

export async function updateCase(id: string, data: Partial<CreateCaseInput>) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) throw new Error('Unauthorized')

  const caseItem = await db.case.findUnique({ where: { id } })
  if (!caseItem) throw new Error('Case not found')

  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (profile?.role !== 'admin' && caseItem.lawyer_id !== user.id) {
    throw new Error('Forbidden: Insufficient permissions to update case')
  }

  const updated = await db.case.update({
    where: { id },
    data
  })
  
  revalidatePath('/workspace')
  revalidatePath(`/workspace/cases/${id}`)
  revalidatePath('/manager')
  return updated
}

export async function deleteCase(id: string) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) throw new Error('Unauthorized')
  
  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (profile?.role !== 'admin') throw new Error('Forbidden: Only admins can delete cases')

  await db.case.delete({
    where: { id }
  })
  
  revalidatePath('/workspace')
  revalidatePath('/manager')
}
