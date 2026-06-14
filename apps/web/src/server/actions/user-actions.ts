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

export async function provisionUser(data: ProvisionUserInput) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const adminProfile = await db.profile.findUnique({ where: { id: user.id } })
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden: Only admins can provision users')

  // Generate a random temporary password if not provided
  const password = data.password || Math.random().toString(36).slice(-10) + 'A1!'

  // Use Admin API to create user, bypassing email verification and auto-confirming
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

  // Create Profile in Database
  const newProfile = await db.profile.create({
    data: {
      id: authData.user.id,
      email: data.email,
      name: data.name,
      role: data.role,
      requires_password_reset: true,
    }
  })

  revalidatePath('/workspace')
  revalidatePath('/manager')

  return { profile: newProfile, tempPassword: password }
}

export async function deactivateUser(userId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const adminProfile = await db.profile.findUnique({ where: { id: user.id } })
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden: Only admins can deactivate users')

  // Ban in Supabase Auth to prevent future logins
  const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h' // Banned for 100 years
  })

  if (banError) {
    throw new Error(`Failed to ban user in auth layer: ${banError.message}`)
  }

  revalidatePath('/manager/team')
  return { success: true }
}
