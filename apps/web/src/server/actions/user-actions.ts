'use server'

import { db } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ProvisionUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'owner', 'managing_partner', 'manager', 'partner', 'lawyer', 'paralegal', 'external_agency', 'client']),
  password: z.string().optional(),
  phone: z.string().optional(),
  passport_number: z.string().optional(),
  emirates_id: z.string().optional()
})

export type ProvisionUserInput = z.infer<typeof ProvisionUserSchema>

/**
 * Provisions a new user in both Supabase Auth and Prisma
 */
export async function provisionUser(rawData: ProvisionUserInput) {
  // Enforce mathematically flawless validation
  const validation = ProvisionUserSchema.safeParse(rawData)
  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.error.message}`)
  }
  const data = validation.data

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const adminProfile = await db.profile.findUnique({ where: { id: user.id } })
  const creatorRole = String(adminProfile?.role).toLowerCase()
  const targetRole = data.role.toLowerCase()

  if (creatorRole === 'manager') {
    if (['admin', 'owner', 'managing_partner', 'manager', 'partner'].includes(targetRole)) {
      throw new Error(`Forbidden: Manager cannot provision a ${targetRole}`)
    }
  } else if (creatorRole === 'lawyer' || creatorRole === 'partner') {
    if (['admin', 'owner', 'managing_partner', 'manager', 'partner', 'lawyer'].includes(targetRole)) {
       throw new Error(`Forbidden: Lawyer cannot provision a ${targetRole}`)
    }
  } else if (['admin', 'owner', 'managing_partner'].includes(creatorRole)) {
    // allowed
  } else {
    throw new Error('Forbidden: Your role does not have provisioning rights')
  }

  const email = data.email.toLowerCase().trim()
  const password = data.password || '123456'

  // 1. Prisma Check: Prevent duplicate firm invites
  const existingProfile = await db.profile.findFirst({ where: { email } })
  if (existingProfile) {
    if (existingProfile.firm_id === adminProfile!.firm_id) {
      throw new Error('This team member is already registered in your firm.')
    } else {
      throw new Error('This email is already actively registered to another firm.')
    }
  }

  let authUserId: string;

  // 2. Supabase Auth Provisioning
  const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      name: data.name,
      role: data.role,
    }
  })

  // 3. Graceful Mapping if user already exists in Auth layer (but not Prisma)
  if (createError) {
    if (createError.message.includes('already been registered') || createError.status === 422) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = listData?.users.find(u => u.email === email)
      
      if (!existingUser) {
        throw new Error('Failed to resolve existing authentication record.')
      }
      authUserId = existingUser.id
    } else {
      throw new Error(`Failed to create user: ${createError.message}`)
    }
  } else {
    authUserId = authData.user!.id
  }

  // 4. Secure Profile Linkage
  const newProfile = await db.profile.upsert({
    where: { id: authUserId },
    update: {
      firm_id: adminProfile!.firm_id,
      full_name: data.name,
      role: data.role,
      is_active: true,
    },
    create: {
      id: authUserId,
      firm_id: adminProfile!.firm_id,
      email: email,
      full_name: data.name,
      role: data.role,
      is_active: true,
    }
  })

  // 5. If Client, create the Client record
  if (data.role === 'client') {
    await db.client.create({
      data: {
        firm_id: adminProfile!.firm_id,
        name: data.name,
        email: email,
        phone: data.phone,
        passport_number: data.passport_number,
        emirates_id: data.emirates_id
      }
    })
  }

  revalidatePath('/workspace')
  revalidatePath('/manager')
  revalidatePath('/manager/team')
  revalidatePath('/manager/clients')

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
  const role = String(adminProfile?.role).toLowerCase()
  const isManagerOrAdmin = role === 'admin' || role === 'owner' || role === 'managing_partner' || role === 'manager'
  if (!isManagerOrAdmin) throw new Error('Forbidden: Only managers/admins can deactivate users')

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
        assigned_to: userId,
        status: { in: ['open', 'in_progress'] }
      },
      data: {
        assigned_to: user.id // Transfer to admin
      }
    })

    // Unassign from active cases by marking assignments as inactive
    await tx.caseAssignment.updateMany({
      where: { user_id: userId },
      data: { active: false }
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
  const role = String(adminProfile?.role).toLowerCase()
  const isManagerOrAdmin = role === 'admin' || role === 'owner' || role === 'managing_partner' || role === 'manager'
  if (!isManagerOrAdmin) throw new Error('Forbidden: Only managers/admins can reactivate users')

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

export async function getProfilesByRole(targetRole: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (!profile) throw new Error('Profile not found')

  return db.profile.findMany({
    where: { role: targetRole, is_active: true, firm_id: profile.firm_id },
    orderBy: { full_name: 'asc' }
  })
}

export async function updateUser(userId: string, data: { name: string; role: string }) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const adminProfile = await db.profile.findUnique({ where: { id: user.id } })
  const role = String(adminProfile?.role).toLowerCase()
  const isManagerOrAdmin = role === 'admin' || role === 'owner' || role === 'managing_partner' || role === 'manager'
  if (!isManagerOrAdmin) throw new Error('Forbidden: Only managers/admins can update users')

  // Update in Supabase
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      name: data.name,
      role: data.role,
    }
  })

  if (updateError) throw new Error(`Auth Update Failed: ${updateError.message}`)

  // Update in Prisma
  await db.profile.update({
    where: { id: userId },
    data: {
      full_name: data.name,
      role: data.role
    }
  })

  revalidatePath('/manager/team')
  revalidatePath('/workspace')
  return { success: true }
}
