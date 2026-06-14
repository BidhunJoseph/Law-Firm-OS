'use server'

import { db } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'

export type ProvisionUserInput = {
  email: string;
  name: string;
  role: Role;
  password?: string;
}

/**
 * Provisions a new user in both Supabase Auth and Prisma
 */
export async function provisionUser(data: ProvisionUserInput) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const adminProfile = await db.profile.findUnique({ where: { id: user.id } })
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden: Only admins can provision users')

  const password = data.password || Math.random().toString(36).slice(-10) + 'A1!'

  // Admin API bypasses email confirmation requirements for seamless provisioning
  const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: password,
    email_confirm: true,
    user_metadata: {
      name: data.name,
      role: data.role,
    }
  })

  if (createError || !authData.user) {
    throw new Error(`Failed to create user: ${createError?.message}`)
  }

  const newProfile = await db.profile.create({
    data: {
      id: authData.user.id,
      email: data.email,
      name: data.name,
      role: data.role,
      requires_password_reset: true,
      is_active: true,
    }
  })

  revalidatePath('/workspace')
  revalidatePath('/manager')
  revalidatePath('/manager/team')

  return { profile: newProfile, tempPassword: password }
}

/**
 * Deactivates a user: Bans them in Supabase, marks inactive in Prisma,
 * and transfers all their active tasks to the calling Admin.
 */
export async function deactivateUser(userId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const adminProfile = await db.profile.findUnique({ where: { id: user.id } })
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden: Only admins can deactivate users')

  if (userId === user.id) {
    throw new Error('You cannot deactivate your own admin account.')
  }

  // 1. Ban user in Auth layer (100 years)
  const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h'
  })

  if (banError) throw new Error(`Auth Ban Failed: ${banError.message}`)

  // 2. Perform deep synchronization (soft delete + task reassignment) inside a Transaction
  await db.$transaction(async (tx) => {
    // Soft delete
    await tx.profile.update({
      where: { id: userId },
      data: { is_active: false }
    })

    // Reassign open tasks to the Admin to prevent data orphans
    await tx.task.updateMany({
      where: {
        assignee_id: userId,
        status: { in: ['pending', 'in_progress'] }
      },
      data: {
        assignee_id: user.id // Transfer to admin
      }
    })
  })

  revalidatePath('/manager/team')
  revalidatePath('/workspace')
  return { success: true }
}

/**
 * Reactivates a previously banned/deactivated user.
 */
export async function reactivateUser(userId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const adminProfile = await db.profile.findUnique({ where: { id: user.id } })
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden: Only admins can reactivate users')

  // 1. Unban user in Auth layer (set ban_duration to "none")
  const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: 'none'
  })

  if (unbanError) throw new Error(`Auth Unban Failed: ${unbanError.message}`)

  // 2. Mark active in Database
  await db.profile.update({
    where: { id: userId },
    data: { is_active: true }
  })

  revalidatePath('/manager/team')
  return { success: true }
}
